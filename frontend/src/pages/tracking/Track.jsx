import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Storage } from '../../utils/utils';

const PositionStackKey = import.meta.env.VITE_POSITIONSTACK_API_KEY || ''; 

const TrackLocation = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const myMarkerRef = useRef(null);
    const theirMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const intervalId = useRef(null);
    
    // UI State
    const [distance, setDistance] = useState('--');
    const [eta, setEta] = useState('--');
    const [statusText, setStatusText] = useState('Locating Professional...');
    const [addressName, setAddressName] = useState('Waiting for location...');
    const [myLat, setMyLat] = useState(null);
    const [myLng, setMyLng] = useState(null);
    const [theirLat, setTheirLat] = useState(null);
    const [theirLng, setTheirLng] = useState(null);

    // URL parameters
    const queryParams = new URLSearchParams(useLocation().search);
    const bookingId = queryParams.get('bookingId');
    const userRole = queryParams.get('role') || 'customer'; // default customer viewing worker
    const theirRole = userRole === 'customer' ? 'worker' : 'customer';

    const navigate = useNavigate();

    // Init Map
    useEffect(() => {
        if (!window.L) {
            console.error("Leaflet not loaded");
            return;
        }

        // Initialize empty map
        mapInstance.current = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
            if (intervalId.current) {
                clearInterval(intervalId.current);
            }
        };
    }, []);

    const fetchAddress = async (lat, lng) => {
        if (!PositionStackKey) {
            setAddressName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (No API Key)`);
            return;
        }
        
        try {
            const url = `http://api.positionstack.com/v1/reverse?access_key=${PositionStackKey}&query=${lat},${lng}&limit=1`;
            const req = await fetch(url);
            const res = await req.json();
            if (res.data && res.data.length > 0) {
                setAddressName(res.data[0].label || res.data[0].name || "Address found");
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        }
    };

    const updateMapMarkers = (mine, theirs) => {
        if (!mapInstance.current || !window.L) return;

        const bounds = window.L.latLngBounds();

        // Update My Marker
        if (mine.lat && mine.lng) {
            const latlng = [mine.lat, mine.lng];
            if (!myMarkerRef.current) {
                myMarkerRef.current = window.L.marker(latlng, {
                    icon: window.L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(mapInstance.current).bindPopup("You");
            } else {
                myMarkerRef.current.setLatLng(latlng);
            }
            bounds.extend(latlng);
        }

        // Update Their Marker
        if (theirs.lat && theirs.lng) {
            const latlng = [theirs.lat, theirs.lng];
            if (!theirMarkerRef.current) {
                theirMarkerRef.current = window.L.marker(latlng, {
                    icon: window.L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(mapInstance.current).bindPopup(theirRole === 'worker' ? "Professional" : "Customer");
                fetchAddress(theirs.lat, theirs.lng);
            } else {
                theirMarkerRef.current.setLatLng(latlng);
            }
            bounds.extend(latlng);
            setStatusText("Location Tracking Active");
        }

        // Draw Line
        if (mine.lat && mine.lng && theirs.lat && theirs.lng) {
            const p1 = [mine.lat, mine.lng];
            const p2 = [theirs.lat, theirs.lng];
            
            if (!polylineRef.current) {
                polylineRef.current = window.L.polyline([p1, p2], {color: 'red'}).addTo(mapInstance.current);
            } else {
                polylineRef.current.setLatLngs([p1, p2]);
            }

            // Simple distance calculation (Haversine formula approximation)
            const R = 6371; // km
            const dLat = (p2[0]-p1[0]) * Math.PI / 180;
            const dLon = (p2[1]-p1[1]) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const d = R * c;
            
            setDistance(d.toFixed(2));
            setEta(Math.round((d / 30) * 60)); // Assuming 30km/h average speed in city
        }

        if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    const fetchOtherLocation = async () => {
        if (!bookingId) return;

        try {
            const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:5000/api' : '/api';
                
            const res = await fetch(`${apiBase}/location/${bookingId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    const theirLoc = data.data[`${theirRole}Location`];
                    if (theirLoc) {
                        setTheirLat(theirLoc.lat);
                        setTheirLng(theirLoc.lng);
                        updateMapMarkers({ lat: myLat, lng: myLng }, { lat: theirLoc.lat, lng: theirLoc.lng });
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch location", e);
        }
    };

    const getMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setMyLat(latitude);
                setMyLng(longitude);
                updateMapMarkers({ lat: latitude, lng: longitude }, { lat: theirLat, lng: theirLng });
                
                // Also update backend with my location so the other person can see where I am
                const userData = Storage.get('BlueBridge_user');
                const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? 'http://localhost:5000/api' : '/api';
                    
                fetch(`${apiBase}/location/${bookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userData?.uid || 'anonymous',
                        userType: userRole,
                        latitude,
                        longitude,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error(err));
            },
            (err) => {
                alert("Failed to get your location");
                console.error(err);
            }
        );
    };

    useEffect(() => {
        // Fetch initially
        fetchOtherLocation();
        
        // Poll every 5 seconds
        intervalId.current = setInterval(fetchOtherLocation, 5000);
        
        return () => clearInterval(intervalId.current);
    }, [bookingId, myLat, myLng]);

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#0f0f0f', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(30, 32, 58, 0.95)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1001 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 style={{ fontSize: '1.2rem', flex: 1, margin: 0 }}>📍 Track Professional</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', background: theirLat ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 206, 0, 0.2)', color: theirLat ? '#00ff88' : '#ffce00' }}>
                    {!theirLat && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'pulse 2s infinite' }}></span>}
                    <span>{statusText}</span>
                </div>
            </div>

            <div ref={mapRef} style={{ flex: 1, zIndex: 1, backgroundColor: '#1a1a1a' }}></div>

            <div style={{ position: 'absolute', top: '90px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 32, 58, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem', minWidth: '320px', zIndex: 1000, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <h3 style={{ marginBottom: '1rem', color: '#00d2ff', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>📍 Location Status</h3>
                
                {theirLat && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#ff3b30' }}></i>
                        {addressName}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '0.3rem' }}>{distance}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Distance (km)</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00ff88', marginBottom: '0.3rem' }}>{eta}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>ETA (min)</div>
                    </div>
                </div>

                {!myLat && (
                    <button 
                        onClick={getMyLocation}
                        style={{ background: 'linear-gradient(135deg, #00d2ff, #a855f7)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '1rem', transition: 'transform 0.2s' }}
                    >
                        <i className="fas fa-crosshairs" style={{ marginRight: '8px' }}></i> Share My Location Too
                    </button>
                )}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}} />
        </div>
    );
};

export default TrackLocation;
