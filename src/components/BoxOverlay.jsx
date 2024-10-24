import React from 'react';

const BoxOverlay = ({ left, top, width, height, text,onClick }) => {
    return (
        <>
            <div
                className='border-2 border-indigo-500/75'
                style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: `${height}px`,

                    backgroundColor: 'rgba(23, 57, 84, 0.2)',  // Semi-transparent background for visibility
                    cursor:'pointer'
                }}
                onClick={onClick}
            >
                {/* Hidden text inside the box for accessibility */}
                <span className="sr-only">{text}</span>
            </div>

        </>
    );
};

export default BoxOverlay;
