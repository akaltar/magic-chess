import RecordRTC, { StereoAudioRecorder } from "recordrtc";

export const recordPCM = (
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
