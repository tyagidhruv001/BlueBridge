import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Storage } from '../../utils/utils';
import { db, doc, onSnapshot } from '../../utils/config';

// Nominatim (OpenStreetMap) is used for free reverse geocoding instead of PositionStack
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse?format=json';

const TrackLocation = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const myMarkerRef = useRef(null);
    const theirMarkerRef = useRef(null);
    const polylineRef = useRef(null);
    const userInteracted = useRef(false);
    
    // UI State
    const [distance, setDistance] = useState('---');
    const [eta, setEta] = useState('---');
    const [statusText, setStatusText] = useState('Calibrating Link...');
    const [addressName, setAddressName] = useState('Establishing contact...');
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
        if (!window.L || !mapRef.current) return;

        // Initialize empty map
        mapInstance.current = window.L.map(mapRef.current, {
            zoomControl: false
        }).setView([20.5937, 78.9629], 5); // Default to India

        window.L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps',
            maxZoom: 20
        }).addTo(mapInstance.current);

        window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        mapInstance.current.on('mousedown touchstart dragstart', () => {
            userInteracted.current = true;
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const fetchAddress = async (lat, lng) => {
        if (!lat || !lng) return;
        try {
            const url = `${NOMINATIM_URL}&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
            const req = await fetch(url, { headers: { 'User-Agent': 'BlueBridge-App' } });
            const res = await req.json();
            if (res.display_name) {
                setAddressName(res.display_name);
            }
        } catch (e) {
            console.error("Geocoding failed", e);
            setAddressName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        }
    };

    const updateMapMarkers = (mine, theirs) => {
        if (!mapInstance.current || !window.L) return;

        const bounds = window.L.latLngBounds();

        // --- Update My Marker (Blue/Cyan) ---
        if (mine.lat && mine.lng) {
            const latlng = [mine.lat, mine.lng];
            const myIcon = window.L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div style="position: relative; width: 24px; height: 24px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #00d2ff; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 15px #00d2ff; z-index: 2;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px; background: rgba(0, 210, 255, 0.2); border-radius: 50%; animation: sonar-wave 2s infinite; z-index: 1;"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            if (!myMarkerRef.current) {
                myMarkerRef.current = window.L.marker(latlng, { icon: myIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);
            } else {
                myMarkerRef.current.setLatLng(latlng);
            }
            bounds.extend(latlng);
        }

        // --- Update Their Marker (Gold) ---
        if (theirs.lat && theirs.lng) {
            const latlng = [theirs.lat, theirs.lng];
            const targetColor = '#ffb800'; 
            const targetLabel = userRole === 'customer' ? 'Professional' : 'Customer';
            const iconClass = userRole === 'customer' ? 'fa-user-tie' : 'fa-user';
            
            const targetIcon = window.L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div style="position: relative; width: 40px; height: 40px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 22px; height: 22px; background: ${targetColor}; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px ${targetColor}; z-index: 2; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${iconClass}" style="color: #000; font-size: 10px;"></i>
                        </div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: ${targetColor}33; border-radius: 50%; animation: sonar-wave 1.2s infinite; z-index: 1;"></div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            if (!theirMarkerRef.current) {
                theirMarkerRef.current = window.L.marker(latlng, { icon: targetIcon, zIndexOffset: 500 }).addTo(mapInstance.current);
                setStatusText(`${targetLabel} Found`);
                fetchAddress(theirs.lat, theirs.lng);
            } else {
                theirMarkerRef.current.setLatLng(latlng);
                if (addressName === 'Establishing contact...') {
                    fetchAddress(theirs.lat, theirs.lng);
                }
            }
            bounds.extend(latlng);
            if (statusText === 'Locating Target...') setStatusText('Tracking Live');
        }

        // --- Draw Glowing Path ---
        if (mine.lat && mine.lng && theirs.lat && theirs.lng) {
            const path = [[mine.lat, mine.lng], [theirs.lat, theirs.lng]];
            if (!polylineRef.current) {
                polylineRef.current = window.L.polyline(path, { 
                    color: '#ffb800', 
                    dashArray: '8, 12', 
                    opacity: 0.4, 
                    weight: 3 
                }).addTo(mapInstance.current);
            } else {
                polylineRef.current.setLatLngs(path);
            }

            const dist = mapInstance.current.distance([mine.lat, mine.lng], [theirs.lat, theirs.lng]) / 1000;
            setDistance(dist.toFixed(2));
            setEta(Math.round(dist * 5)); 
        }

        if (bounds.isValid() && !userInteracted.current) {
            mapInstance.current.fitBounds(bounds, { padding: [100, 100] });
        }
    };

    const getIPLocation = async () => {
        try {
            console.log('🌐 Tracking Fallback: fetching IP location...');
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
                const { latitude, longitude } = data;
                setMyLat(latitude);
                setMyLng(longitude);
                updateMapMarkers({ lat: latitude, lng: longitude }, { lat: theirLat, lng: theirLng });
                syncLocationToDB(latitude, longitude);
                return true;
            }
        } catch (e) {
            console.error('IP Fallback failed', e);
        }
        return false;
    };

    const syncLocationToDB = (latitude, longitude) => {
        if (!bookingId) return;
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
        }).catch(err => console.error('GPS sync error:', err));
    };

    const getMyLocation = () => {
        if (!navigator.geolocation) {
            getIPLocation();
            return;
        }
        
        setStatusText('Sharing your location...');
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setMyLat(latitude);
                setMyLng(longitude);
                updateMapMarkers({ lat: latitude, lng: longitude }, { lat: theirLat, lng: theirLng });
                syncLocationToDB(latitude, longitude);
            },
            async (err) => {
                console.warn('Geolocation failed, trying IP...', err);
                const success = await getIPLocation();
                if (!success) setStatusText('Location Blocked');
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    // My Watcher
    useEffect(() => {
        if (!navigator.geolocation || !bookingId) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setMyLat(latitude);
                setMyLng(longitude);
                updateMapMarkers({ lat: latitude, lng: longitude }, { lat: theirLat, lng: theirLng });
                syncLocationToDB(latitude, longitude);
            },
            (err) => {
                console.warn('Watch error', err);
                if (!myLat) getIPLocation();
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [bookingId, theirLat, theirLng]);

    // Multi-Role Listener (Source of Truth: Firestore)
    useEffect(() => {
        if (!bookingId || !db) return;

        console.log(`🛰️ Establishing DB Connection for Booking: ${bookingId}`);
        const unsub = onSnapshot(doc(db, 'locations', bookingId), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                
                // Update My Data from DB (Sync from other tabs)
                const me = data[`${userRole}Location`];
                if (me && me.lat && me.lng) {
                    setMyLat(me.lat);
                    setMyLng(me.lng);
                }

                // Update Their Data from DB (Live)
                const them = data[`${theirRole}Location`];
                if (them && them.lat && them.lng) {
                    setTheirLat(them.lat);
                    setTheirLng(them.lng);
                    if (statusText.includes('Locating') || statusText.includes('contact')) {
                        setStatusText('Signal Locked');
                    }
                }

                // Refresh Markers if data exists
                if (me?.lat || them?.lat) {
                    updateMapMarkers(
                        me || { lat: myLat, lng: myLng }, 
                        them || { lat: theirLat, lng: theirLng }
                    );
                }
            }
        });

        return () => unsub();
    }, [bookingId, userRole, theirRole]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#050608', color: '#fff', overflow: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
            
            {/* --- TOP NAVIGATION BAR --- */}
            <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, 
                display: 'flex', alignItems: 'center', padding: '1rem 1.5rem',
                background: 'linear-gradient(to bottom, rgba(5, 6, 8, 0.9) 0%, rgba(5, 6, 8, 0.4) 50%, transparent 100%)',
                backdropFilter: 'blur(8px)'
            }}>
                <button onClick={() => navigate(-1)} style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', 
                    color: '#fff', width: '40px', height: '40px', borderRadius: '12px', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} className="nav-back-btn">
                    <i className="fas fa-chevron-left"></i>
                </button>
                
                <div style={{ marginLeft: '1.2rem', flex: 1 }}>
                    <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1px' }}>
                        Live Satellite Connection
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
                        {userRole === 'customer' ? 'Tracking Professional' : 'Navigating to Customer'}
                    </h1>
                </div>

                <div style={{ 
                    padding: '0.5rem 1rem', borderRadius: '40px', 
                    background: theirLat ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 184, 0, 0.1)',
                    border: `1px solid ${theirLat ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255, 184, 0, 0.3)'}`,
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    boxShadow: `0 0 20px ${theirLat ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 184, 0, 0.1)'}`
                }}>
                    <span style={{ 
                        width: '6px', height: '6px', borderRadius: '50%', 
                        background: theirLat ? '#00d2ff' : '#ffb800',
                        animation: 'radar-pulse 2s infinite' 
                    }}></span>
                    <span style={{ color: theirLat ? '#00d2ff' : '#ffb800', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {statusText}
                    </span>
                </div>
            </div>

            {/* --- MAP CONTAINER --- */}
            <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>

            {/* --- BOTTOM INFORMATION COCKPIT --- */}
            <div style={{ 
                position: 'absolute', bottom: '2rem', left: '2rem',
                width: 'min(92%, 380px)', zIndex: 1000, 
            }} className="hud-animate">
                <div style={{ 
                    background: 'rgba(10, 11, 18, 0.75)', backdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px',
                    padding: '1.5rem', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                }}>
                    
                    {/* Destination Address Panel */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffb800', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.6rem' }}>
                            <i className="fas fa-location-arrow"></i> Target Destination
                        </div>
                        <div style={{ 
                            fontSize: '0.95rem', fontWeight: '600', color: '#fff', 
                            lineHeight: '1.4', transition: 'all 0.5s ease',
                            opacity: addressName === 'Establishing contact...' ? 0.5 : 1
                        }}>
                            {addressName}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: distance === '---' ? 'rgba(255,255,255,0.1)' : '#00d2ff', letterSpacing: '-1px', marginBottom: '2px' }}>
                                {distance}
                            </div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                {distance === '---' ? 'Searching...' : 'Kilometers'}
                            </div>
                        </div>
                        
                        <div style={{ padding: '1rem', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: eta === '---' ? 'rgba(255,255,255,0.1)' : '#ffb800', letterSpacing: '-1px', marginBottom: '2px' }}>
                                {eta}
                            </div>
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                {eta === '---' ? 'Calculating...' : 'Minutes'}
                            </div>
                        </div>
                    </div>

                    {/* Action Button for untracked state */}
                    {!myLat && (
                        <button onClick={getMyLocation} style={{ 
                            fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                            boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.3s ease'
                        }} className="main-action-btn">
                            <i className="fas fa-radar"></i> START LIVE TRACKING
                        </button>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');

                @keyframes radar-pulse {
                    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 184, 0, 0.4); }
                    70% { transform: scale(1.8); opacity: 0; box-shadow: 0 0 0 15px rgba(255, 184, 0, 0); }
                    100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 0 rgba(255, 184, 0, 0); }
                }

                @keyframes sonar-wave {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }

                .leaflet-container { background: #050608 !important; }
                .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.75) contrast(1.1); }
                
                .nav-back-btn:hover { background: rgba(255, 255, 255, 0.1) !important; transform: scale(1.05); }
                .main-action-btn:hover { transform: translateY(-5px); box-shadow: 0 10px 40px rgba(255, 255, 255, 0.2); }

                .leaflet-marker-icon { 
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                .custom-div-icon { background: none !important; border: none !important; }
                
                /* Sonar Ring styling happens via JS in divIcon html */
            `}} />
        </div>
    );
};

export default TrackLocation;
