import React, { useEffect, useState } from 'react';
import '../styles/cursor.css';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            // Check if hovering over clickable elements
            if (e.target.closest('a, button, .role-card-3d, .action-indicator, input, textarea, .glass-feature')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Also track clicks for a tiny "pulse" animation
    const [isClicked, setIsClicked] = useState(false);
    useEffect(() => {
        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    return (
        <>
            <div
                className={`custom-cursor-dot ${isHovering ? 'hovering' : ''} ${isClicked ? 'clicked' : ''}`}
                style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0)`
                }}
            ></div>
            <div
                className={`custom-cursor-ring ${isHovering ? 'hovering' : ''} ${isClicked ? 'clicked' : ''}`}
                style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0)`
                }}
            ></div>
        </>
    );
};

export default CustomCursor;
