import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Storage } from '../../utils/utils';

const PositionStackKey = import.meta.env.VITE_POSITIONSTACK_API_KEY || ''; 

const ShareLocation = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const watchId = useRef(null);
    
    // UI State
    const [isSharing, setIsSharing] = useState(false);
    const [accuracy, setAccuracy] = useState('--');
    const [updates, setUpdates] = useState(0);
    const [statusMsg, setStatusMsg] = useState('Tap toggle to start sharing your location');
    const [lastUpdate, setLastUpdate] = useState('Ready to share');
    const [addressName, setAddressName] = useState('Locating...');

    // URL parameters
    const queryParams = new URLSearchParams(useLocation().search);
    const bookingId = queryParams.get('bookingId');
    const userRole = queryParams.get('role') || 'worker'; // or customer

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
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
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
            } else {
                setAddressName("Unknown location");
            }
        } catch (e) {
            console.error("Geocoding failed", e);
            setAddressName("Location mapped");
        }
    };

    const updateBackendLocation = async (lat, lng) => {
        if (!bookingId) return;

        try {
            const userData = Storage.get('BlueBridge_user');
            const uid = userData?.uid || 'anonymous';
            
            // Adjust to use the backend /api/location API if available!
            // According to location.routes.js:
            const payload = {
                userId: uid,
                userType: userRole,
                latitude: lat,
                longitude: lng,
                timestamp: new Date().toISOString()
            };
            
            // We use standard fetch just assuming the API route exists via proxy
            // In development proxy handles /api
            const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:5000/api' : '/api';
                
            const res = await fetch(`${apiBase}/location/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                setUpdates(prev => prev + 1);
                setLastUpdate(`Updated: ${new Date().toLocaleTimeString()}`);
            } else {
                console.error("Failed to update backend location:", await res.text());
                setStatusMsg("Network Error: Could not save location.");
            }
        } catch(e) {
            console.error(e);
            setStatusMsg("Failed to reach server.");
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            setStatusMsg("Geolocation is not supported by your browser");
            return;
        }

        setStatusMsg("Locating...");
        setIsSharing(true);

        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy: locAccuracy } = pos.coords;
                
                setAccuracy(Math.round(locAccuracy));
                setStatusMsg("Live sharing active");
                
                // Update map
                if (mapInstance.current) {
                    const latlng = [latitude, longitude];
                    mapInstance.current.setView(latlng, 16);
                    
                    if (!markerRef.current) {
                        markerRef.current = window.L.marker(latlng).addTo(mapInstance.current);
                        // Start reverse geocoding
                        fetchAddress(latitude, longitude);
                    } else {
                        markerRef.current.setLatLng(latlng);
                        // Debounced address fetch could be done here if movement is significant
                    }
                }
                
                // Send to backend
                updateBackendLocation(latitude, longitude);
            },
            (err) => {
                console.error("GPS Error:", err);
                setIsSharing(false);
                setStatusMsg(`Error: ${err.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsSharing(false);
        setStatusMsg("Sharing paused");
        setLastUpdate("Ready to resume");
    };

    const toggleSharing = () => {
        if (isSharing) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#0f0f0f', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'rgba(30, 32, 58, 0.95)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1001 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h1 style={{ fontSize: '1.2rem', flex: 1, margin: 0 }}>📱 Share Your Location</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{isSharing ? 'On' : 'Off'}</span>
                    <div 
                        onClick={toggleSharing}
                        style={{ position: 'relative', width: '60px', height: '30px', background: isSharing ? '#00ff88' : 'rgba(255, 255, 255, 0.2)', borderRadius: '15px', cursor: 'pointer', transition: 'background 0.3s' }}
                    >
                        <div style={{ position: 'absolute', top: '3px', left: '3px', width: '24px', height: '24px', background: 'white', borderRadius: '50%', transition: 'transform 0.3s', transform: isSharing ? 'translateX(30px)' : 'translateX(0)' }}></div>
                    </div>
                </div>
            </div>

            <div ref={mapRef} style={{ flex: 1, zIndex: 1, backgroundColor: '#1a1a1a' }}></div>

            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 32, 58, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem', minWidth: '320px', zIndex: 1000, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                {isSharing && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#00ff88' }}></i>
                        {addressName}
                    </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#00d2ff', marginBottom: '0.3rem' }}>{accuracy}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>GPS Accuracy (m)</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#00d2ff', marginBottom: '0.3rem' }}>{updates}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Updates Sent</div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', background: isSharing ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: isSharing ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' }}>
                    {statusMsg}
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                    {lastUpdate}
                </div>
            </div>
        </div>
    );
};

export default ShareLocation;
