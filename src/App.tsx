import "./App.css";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

import { useState } from "react";
import Chessground from "@react-chess/chessground";

import {
  LiveTranscriptResults,
  useLiveTranscription,
} from "./liveTranscription";

import { Chess } from "chess.js";
import styled from "styled-components";
const MainLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 90%;
  margin-top: 2.5%;
  margin-bottom: 2.5%;
`;
const LeftBar = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;
  margin-right: 2.5%;
  margin-left: 2.5%;
`;

const ChessContainer = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  margin-right: 2.5%;
  aspect-ratio: 1 / 1;
`;
const DebugView = (props: { transcript: LiveTranscriptResults }) => {
  return (
    <>
      {props.transcript.final.map((text) => (
        <p>{text}</p>
      ))}
      <p>{props.transcript.currentPartial}</p>
    </>
  );
};

const App = () => {
  const { isRecording, transcript, startRecording } = useLiveTranscription();
  const [chessState, setChessState] = useState<Chess>(new Chess());

  return (
    <MainLayout>
      <LeftBar>
        {isRecording ? (
          <p>Recording...</p>
        ) : (
          <button onClick={startRecording}>Start recording</button>
        )}
        <DebugView transcript={transcript} />
      </LeftBar>
      <ChessContainer>
        <Chessground
          contained={true}
          config={{ viewOnly: true, fen: chessState.fen() }}
        />
      </ChessContainer>
    </MainLayout>
  );
};

export default App;
