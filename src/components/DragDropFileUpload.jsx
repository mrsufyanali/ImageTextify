import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ClipLoader } from 'react-spinners';
import { uploadIcon } from '../assets';

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

    fetch('http://localhost:8000/uploadImage', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.request_id) {
          setRequestId(result.request_id);

          // Start SSE connection for queue updates
          const es = new EventSource(`http://localhost:8000/queueStatus?request_id=${result.request_id}`);
          es.onmessage = (event) => {
            const position = parseInt(event.data);
            setQueuePosition(position);

            if (position === 0) {
              // When it's the user's turn, close SSE and initiate the processing request only once
              es.close();
              setEventSource(null);

              fetch(`http://localhost:8000/processImage/${result.request_id}`, { method: 'POST' })
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
    <div className="flex items-center justify-center h-screen">
      <div
        {...getRootProps()}
        className={`w-80 p-6 rounded-lg shadow-lg border-dashed border-2 transition-all duration-150 ease-in-out ${isDragActive ? 'border-blue-500 h-[100vh] w-[100vw]' : 'border-gray-600'
          } bg-gray-800 flex flex-col items-center justify-center `}
      >
        <input {...getInputProps()} />
        <div className="text-white">
          {isDragActive ? (
            <div className="flex flex-col items-center justify-center">
              <img src={uploadIcon} className='w-20' alt="upload icon" srcset="" />
              <p>Drop the files here...</p>
            </div>
          ) : (
            <p>Drag n drop some files here, or click to select files</p>
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
        <button
          onClick={handleSubmit}
          className="ml-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none"
          disabled={loading}  // Disable button to prevent duplicate submissions
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : 'Submit'}
        </button>
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
