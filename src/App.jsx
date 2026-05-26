import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createWorker } from 'tesseract.js';
import MeterCapture from './components/MeterCapture';

function App() {
  // const [selectedImg, setSelectedImg] = useState(null);
  // const [textResult, setTextResult] = useState("");

  // const handleChangeImg = (e) => {
  //   setSelectedImg(e.target.files[0]);
  // }

  // const convertImgToText = async () => {
  //   if (!selectedImg) return;

  //   const worker = await createWorker("eng");


  //   const dataDetect = await worker.recognize(selectedImg);


  //   console.log(dataDetect);

  //   setTextResult(dataDetect.data.text);

  //   await worker.terminate();
  // }

  // useEffect(() => {
  //   convertImgToText();
  // }, [selectedImg])

  return (
    <>
      <h1>Text</h1>
      <h2>Nhận diện chỉ số điện / nước</h2>
      <MeterCapture />
      {/* <div className='input-wrapper'>
        <label htmlFor="upload">Upload Image</label>
        <input type="file" id='upload' accept='image/*' onChange={handleChangeImg} />
      </div>

      <div className='result'>
        {selectedImg && (
          <div className='box-image'>
            <img src={URL.createObjectURL(selectedImg)} alt="thumb" />
          </div>
        )}

        {textResult && (
          <div className='box-p'>
            <p>{textResult}</p>
          </div>
        )}

      </div> */}
    </>
  )
}

export default App
