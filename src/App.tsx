import { useState } from "react";
import "./App.css";

function App() {
  const startRecording = async () => {
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    console.log(userMedia);
    const mediaRecorder = new MediaRecorder(userMedia, {
      mimeType: "audio/x-wav;codec=pcm;rate=16000",
    });
    mediaRecorder.ondataavailable = (blobEvent) => {
      const audioBlob = blobEvent.data;
    };
  };

  return (
    <div className="App">
      <button onClick={startRecording}>Start recording</button>
    </div>
  );
}

export default App;
