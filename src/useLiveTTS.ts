type ElevenLabsStreamRequestBody = {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
};

const OptimizeLatencyOptionsMap = {
  default: "0",
  medium: "1",
  high: "2",
  maximum: "3",
  maximum_no_normalize: "4",
};

type OptimizeLatencyOptions = keyof typeof OptimizeLatencyOptionsMap;

const getStreamingUrl = (
  voiceId: string,
  optimizeLatency: OptimizeLatencyOptions
) => {
  const latencyOption = OptimizeLatencyOptionsMap[optimizeLatency];
  // Not using streaming endpoint yet as it's hard to actually stream on
  // the web.
  return `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=${latencyOption}`;
};

const TTSPersonaToVoiceId = {
  pirate: "26E5gRcNrCczdH3wUJGs",
};

type TTSPersona = keyof typeof TTSPersonaToVoiceId;

export const streamTTS = (
  text: string,
  persona: TTSPersona
): Promise<Response> => {
  const streamingUrl = getStreamingUrl(TTSPersonaToVoiceId[persona], "default");
  const streamRequest: ElevenLabsStreamRequestBody = {
    model_id: "eleven_monolingual_v1",
    text,
    voice_settings: {
      similarity_boost: 0.8,
      stability: 0.7,
    },
  };

  return fetch(streamingUrl, {
    method: "POST",
    headers: {
      "xi-api-key": import.meta.env.VITE_XI_API_KEY,
      "Content-Type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify(streamRequest),
  });
};
