import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ClipLoader } from 'react-spinners';
import { arrowIcon, logo, uploadIcon } from '../assets';

const DragDropFileUpload = ({ toast, ocrSuccess, setOcrSuccess, ocrData, setOcrData, setPreview }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 1 * 1024 * 1024) {  // 1MB limit
        toast.error('File too large. Max size is 1MB.');
        return;
      }
      setFile(
        Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        }))
      setPreview(URL.createObjectURL(selectedFile));
    },
  });

  const handleSubmit = () => {
    if (!file || loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch('https://imagetextserver.mahmudrahman.me/uploadImage', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.request_id) {
          setRequestId(result.request_id);

          // Start SSE connection for queue updates
          const es = new EventSource(`https://imagetextserver.mahmudrahman.me/queueStatus?request_id=${result.request_id}`);
          es.onmessage = (event) => {
            const position = parseInt(event.data);

            setQueuePosition(position);

            if (position === 0) {
              // When it's the user's turn, close SSE and initiate the processing request only once
              es.close();
              setEventSource(null);

              fetch(`https://imagetextserver.mahmudrahman.me/processImage/${result.request_id}`, { method: 'POST' })
                .then((res) => res.json())
                .then((data) => {
                  setLoading(false);
                  setOcrSuccess(true);
                  setOcrData(data.solution);
                })
                .catch((error) => {
                  console.error('Error processing image:', error);
                  toast.error('Error processing image. Please try again.');
                  setLoading(false);
                });
            }
          };

          es.onerror = () => {
            es.close();
            setLoading(false);
            setEventSource(null);
            toast.error('Error with server connection.');
          };

          setEventSource(es);
        } else {
          throw new Error('Failed to upload');
        }
      })
      .catch((error) => {
        toast.error('Error uploading file. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    return () => {
      // Ensure SSE connection is closed on component unmount
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="text-white flex flex-col items-center mb-8">
        <img src={logo} alt="ImageTextify Logo" className="w-12 h-12 mb-2" />
        <div className="motto text-center">
          <h2 className="text-2xl font-bold">ImageTextify</h2>
          <p className="text-sm text-slate-500 mt-1">-Turn images into words, effortlessly!📜</p>
        </div>
      </div>
      <div
        {...getRootProps()}
        className={`w-80 py-16 px-6 rounded-lg shadow-lg border-dashed border-2 transition-all duration-150 ease-in-out ${
          isDragActive ? 'border-blue-500 h-[100vh] w-[100vw]' : 'border-gray-600'
        } bg-gray-800 flex flex-col items-center justify-center`}
      >
        <input {...getInputProps()} />
        <div className="text-white">
          {isDragActive ? (
            <div className="flex flex-col items-center justify-center">
              <img src={uploadIcon} className="w-20" alt="Upload Icon" />
              <p>Drop the files here...</p>
            </div>
          ) : (
            <p>Drag and drop some files here, or click to select files</p>
          )}
        </div>
        {file && (
          <div className="mt-4">
            <img
              src={file.preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md"
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          </div>
        )}
      </div>
      {file && (
        <div className="w-80">
          <button
            onClick={handleSubmit}
            className="flex justify-center items-center mt-2 w-full bg-cyan-900 text-white px-4 py-2 rounded-lg hover:bg-cyan-950 focus:outline-none"
            disabled={loading}
          >
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : (
              <>
                <img src={arrowIcon} alt="Arrow Icon" className="w-8 h-8" />Submit
              </>
            )}
          </button>
        </div>
      )}
      {queuePosition !== null && (
        <div className="mt-4 text-white">
          {queuePosition > 0
            ? `Your position in the queue: ${queuePosition}. Please wait for your turn...`
            : 'Processing your file...'}
        </div>
      )}
    </div>
  );
  
};

export default DragDropFileUpload;
