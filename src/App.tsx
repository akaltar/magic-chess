import "./App.css";

import { useLiveTranscription } from "./liveTranscription";

const App = () => {
  const { isRecording, transcript, startRecording } = useLiveTranscription();

  return (
    <div className="App">
      {isRecording ? (
        <p>Recording...</p>
      ) : (
        <button onClick={startRecording}>Start recording</button>
      )}
      <br />
      {transcript.final.map((text) => (
        <p>{text}</p>
      ))}
      <p>{transcript.currentPartial}</p>
    </div>
  );
};

export default App;
