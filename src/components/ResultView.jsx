import React, { useState, useEffect, useRef } from 'react';
import BoxOverlay from './BoxOverlay';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResultView = ({ ocrSuccess, setOcrSuccess, ocrData, setOcrData, preview }) => {
    const imgRef = useRef(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [scaledData, setScaledData] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [copiedText, setCopiedText] = useState('');  // To store all the OCR text

    // Function to calculate new positions and dimensions
    const calculateScaledData = () => {
        const img = imgRef.current;
        if (!img) return;

        const displayedWidth = img.clientWidth;
        const displayedHeight = img.clientHeight;
        const actualWidth = img.naturalWidth;
        const actualHeight = img.naturalHeight;

        const widthRatio = displayedWidth / actualWidth;
        const heightRatio = displayedHeight / actualHeight;

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
                calculateScaledData();
            };
        }

        const handleResize = () => {
            calculateScaledData();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [ocrData, imageSize]);

    // Function to handle box click
    const handleBoxClick = (index) => {
        setSelectedBox(index);
    };

    // Collect all the OCR text into one string for copying
    useEffect(() => {
        const allText = scaledData.map((data) => data.text).join(' ');
        setCopiedText(allText);
    }, [scaledData]);

    // Function to handle the "Copy to Clipboard" action
    const handleCopy = () => {
        toast.success("Text copied to clipboard!", { position: 'bottom-right' });
    };

    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-center items-center text-slate-200">
                <div className="relative flex flex-col md:flex-row md:space-x-6 w-full max-w-7xl h-full py-3 justify-center items-center">
                    {/* Image with overlay container */}
                    <div className="relative flex justify-center w-full md:w-2/4 max-h-full">
                        <img
                            ref={imgRef}
                            src={preview}
                            className="w-full h-auto object-cover border-2 border-indigo-500/75 shadow-lg border-dashed"
                            onLoad={() => {
                                URL.revokeObjectURL(preview); // Clean up after previewing
                            }}
                            alt="Preview"
                            onClick={() => setSelectedBox(null)}
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
                                onClick={() => handleBoxClick(index)}  // Handle click on the box
                            />
                        ))}
                    </div>

                    {/* Text and Copy button */}
                    <div className="relative w-full md:w-2/4 h-full border-2 border-indigo-500/75 p-4 overflow-y-hidden overflow-x-hidden ">
                        <div className="content mb-24 h-full overflow-y-auto overflow-x-hidden "> {/* Added mb-16 to prevent content overlap with the button */}
                            {scaledData.map((data, index) => (
                                <span
                                    key={index}
                                    className={`mr-2 transition duration-300 ease-in-out ${(selectedBox === index && selectedBox != null) ? 'text-white' : 'text-gray-500'}`}  // Apply bright or dull white based on selection
                                >
                                    {data.text}
                                </span>

                            ))}
                            <br />
                            <br />
                            <br />
                        </div>
                        {/* Copy to Clipboard button - stays at the bottom of the container */}
                        <div className="absolute bottom-4 right-4 ">
                            <button 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none mr-2"
                            onClick={()=>setOcrSuccess(false)}
                            >
                                Back
                            </button>
                            <CopyToClipboard text={copiedText} onCopy={handleCopy}>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none">
                                    Copy to Clipboard
                                </button>
                            </CopyToClipboard>
                        </div>
                    </div>

                </div>
                <ToastContainer />
            </div>
        </>
    );
};

export default ResultView;
