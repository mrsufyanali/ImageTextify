import { useState } from 'react'
import './App.css'
import DragDropFileUpload from './components/DragDropFileUpload'
import ResultView from './components/ResultView';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrData, setOcrData] = useState({})
  const [preview, setPreview] = useState(null)
  return (
    <>
      <div className='bg-gray-900'>
        {!ocrSuccess ?
          <DragDropFileUpload
            toast={toast}
            ocrSuccess={ocrSuccess}
            setOcrSuccess={setOcrSuccess}
            ocrData={ocrData}
            setOcrData={setOcrData}
            setPreview={setPreview} /> :
          <ResultView
            toast={toast}
            ocrSuccess={ocrSuccess}
            setOcrSuccess={setOcrSuccess}
            ocrData={ocrData}
            setOcrData={setOcrData}
            preview={preview} />
        }

        <ToastContainer />

      </div>
    </>
  )
}

export default App
