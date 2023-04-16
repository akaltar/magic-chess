import { useState } from "react";
import { recordPCM } from "./recordPCM";

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

interface LiveTranscriptResults {
  final: string[];
  currentPartial: string;
}

interface AssemblyWord {
  confidence: number;
  start: number;
  end: number;
  text: string;
}

interface AssemblySessionBeginsMessage {
  message_type: "SessionBegins";
  session_id: string;
  expires_at: string;
}

interface AssemblyPartialTranscriptMessage {
  message_type: "PartialTranscript";
  audio_start: number;
  audio_end: number;
  confidence: number;
  text: string;
  words: AssemblyWord[];
  punctuated: boolean;
  text_formatted: boolean;
  created: string;
}

interface AssemblyFinalTranscriptMessage {
  message_type: "FinalTranscript";
  audio_start: number;
  audio_end: number;
  confidence: number;
  text: string;
  words: AssemblyWord[];
  punctuated: boolean;
  text_formatted: boolean;
  created: string;
}

type AssemblyAIMessage =
  | AssemblySessionBeginsMessage
  | AssemblyPartialTranscriptMessage
  | AssemblyFinalTranscriptMessage;

export const useLiveTranscription = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<LiveTranscriptResults>({
    final: [],
    currentPartial: "",
  });

  const startRecording = async () => {
    setIsRecording(true);
    const userMedia = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
    const socket = await createTranscriptionWebsocket(API_KEY);

    socket.onmessage = (message) => {
      const messageData = JSON.parse(message.data) as AssemblyAIMessage;
      console.log("parsed:", messageData);
      if (messageData.message_type === "PartialTranscript") {
        setTranscript((lastTranscript) => ({
          final: lastTranscript.final,
          currentPartial: messageData.text,
        }));
      } else if (messageData.message_type === "FinalTranscript") {
        setTranscript((lastTranscript) => ({
          final: lastTranscript.final.concat([messageData.text]),
          currentPartial: "",
        }));
      }
    };

    const recorder = recordPCM(userMedia, (blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result as string;

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
      setIsRecording(false);
    }, 10000);
  };

  return { isRecording, transcript, startRecording };
};
