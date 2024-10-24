import { useState } from 'react'
import './App.css'
import DragDropFileUpload from './components/DragDropFileUpload'
import ResultView from './components/ResultView';

function App() {
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrData, setOcrData] = useState({})
  const [preview, setPreview] = useState(null)
  return (
    <>
      <div className='bg-gray-900'>
        {!ocrSuccess ?
          <DragDropFileUpload
            ocrSuccess={ocrSuccess}
            setOcrSuccess={setOcrSuccess}
            ocrData={ocrData}
            setOcrData={setOcrData}
            setPreview={setPreview} /> :
          <ResultView
            ocrSuccess={ocrSuccess}
            setOcrSuccess={setOcrSuccess}
            ocrData={ocrData}
            setOcrData={setOcrData}
            preview={preview} />
        }
      </div>
    </>
  )
}

export default App
