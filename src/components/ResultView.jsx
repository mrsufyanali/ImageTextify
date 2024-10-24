import React, { useState, useEffect, useRef } from 'react';
import BoxOverlay from './BoxOverlay';

const ResultView = ({ ocrSuccess, setOcrSuccess, ocrData, setOcrData, preview }) => {
    const imgRef = useRef(null);  // To access the image DOM element
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [scaledData, setScaledData] = useState([]);

    // Function to calculate new positions and dimensions
    const calculateScaledData = () => {
        const img = imgRef.current;
        if (!img) return;

        // Get the actual and displayed image sizes
        const displayedWidth = img.clientWidth;
        const displayedHeight = img.clientHeight;
        const actualWidth = img.naturalWidth;
        const actualHeight = img.naturalHeight;

        // Calculate scale factors
        const widthRatio = displayedWidth / actualWidth;
        const heightRatio = displayedHeight / actualHeight;

        // Update each OCR data's position and size
        const updatedData = ocrData.map((data) => ({
            ...data,
            newLeft: data.left * widthRatio,
            newTop: data.top * heightRatio,
            newWidth: data.width * widthRatio,
            newHeight: data.height * heightRatio,
        }));

        setScaledData(updatedData);
    };

    // Call calculateScaledData whenever image loads or window resizes
    useEffect(() => {
        const img = imgRef.current;
        if (img) {
            img.onload = () => {
                setImageSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                });
                calculateScaledData(); // Recalculate positions after image is loaded
            };
        }

        // Recalculate positions when the window is resized
        const handleResize = () => {
            calculateScaledData();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize); // Clean up listener
        };
    }, [ocrData, imageSize]); // Rerun if OCR data or image size changes

    return (
        <>
            <div className="h-screen w-screen flex justify-center items-center text-slate-200">
                <div className="relative w-3/4 h-full py-3 flex justify-center items-center">
                    {/* Image with overlay container */}
                    <div className="w-2/4 flex justify-center relative">
                        <img
                            ref={imgRef}
                            src={preview}
                            className="w-100 mr-2 object-cover border-2 border-indigo-500/75 shadow-lg border-dashed"
                            onLoad={() => {
                                URL.revokeObjectURL(preview); // Clean up after previewing
                            }}
                            alt="Preview"
                        />
                        {/* Overlay boxes for OCR data */}
                        {scaledData.map((data, index) => (
                            <BoxOverlay
                                key={index}
                                left={data.newLeft}
                                top={data.newTop}
                                width={data.newWidth}
                                height={data.newHeight}
                                text={data.text}
                            />
                        ))}
                    </div>
                    <div className="w-2/4 h-full border-2 border-indigo-500/75 p-4 overflow-y-auto">
                        {scaledData.map((data, index) => (
                            <span key={index} className="mr-2">
                                {data.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResultView;
