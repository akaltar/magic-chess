import { useState } from "react";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import "./App.css";

let socket: WebSocket | null = null;

const recordPCM = (
  stream: MediaStream,
  onDataAvailable: (blob: Blob) => void
): { stop: () => void } => {
  const mediaRecorder = new RecordRTC(stream, {
    type: "audio",
    mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
    recorderType: StereoAudioRecorder,
    timeSlice: 250, // set 250 ms intervals of data that sends to AAI
    desiredSampRate: 16000,
    numberOfAudioChannels: 1, // real-time requires only one channel
    bufferSize: 4096,
    audioBitsPerSecond: 128000,
    ondataavailable: onDataAvailable,
  });
  mediaRecorder.startRecording();

  return { stop: () => mediaRecorder.stopRecording() };
};

const createTranscriptionWebsocket = async (apiKey: string) => {
  const response = await fetch("/gettoken", {
    method: "POST",
    headers: { authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ expires_in: 3600 }),
  });
  const data = await response.json();
  return new WebSocket(
    `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${data.token}`
  );
};

function App() {
  const [text, setText] = useState<string>(
    "Start recording to see your text here"
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const startRecording = async () => {
    setIsRecording(true);
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    console.log("recording on: ", userMedia);

    const API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
    console.log("Using token: ", API_KEY);
    const socket = await createTranscriptionWebsocket(API_KEY);

    socket.onmessage = (message) => {
      console.log(message);
      const messageData = JSON.parse(message.data);
      console.log("parsed:", messageData);
      if (messageData.message_type === "PartialTranscript") {
        console.log("setting text");
        setText(messageData.text);
      }
    };

    const recorder = recordPCM(userMedia, (blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result as string;

        console.log("Got", base64data.length);

        // audio data must be sent as a base64 encoded string
        if (socket) {
          socket.send(
            JSON.stringify({ audio_data: base64data.split("base64,")[1] })
          );
        }
      };
      reader.readAsDataURL(blob);
    });

    setTimeout(() => {
      recorder.stop();
      socket.close();
    }, 5000);
  };

  return (
    <div className="App">
      {isRecording ? (
        <p>Recording...</p>
      ) : (
        <button onClick={startRecording}>Start recording</button>
      )}
      <br />
      <p>{text}</p>
    </div>
  );
}

export default App;
