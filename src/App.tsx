import "./App.css";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

import styled from "styled-components";
import { useEffect, useState } from "react";
import Chessground from "@react-chess/chessground";
import { Chess, PieceSymbol, Square } from "chess.js";

import {
  LiveTranscriptResults,
  useLiveTranscription,
} from "./useLiveTranscription";

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

const PieceNames: Record<string, PieceSymbol> = {
  king: "k",
  queen: "q",
  bishop: "b",
  knight: "n",
  night: "n",
  nine: "n",
  rook: "r",
  pawn: "p",
};

const parsePiece = (pieceName: string): PieceSymbol | undefined => {
  const piece = PieceNames[pieceName];
  return piece;
};

const Numbers: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
};

const validLanes = ["a", "b", "c", "d", "e", "f", "g", "h"];

const parseSquare = (words: string[]): Square | undefined => {
  if (words.length < 4) return;

  const char = words[2][0];
  if (!validLanes.includes(char)) return;

  const Number = Numbers[words[3]];
  if (!Number) return;

  return `${char}${Number}` as Square;
};

const normalizeUtterance = (utterance: string) => {
  let ret = utterance.toLowerCase();
  ret = ret.replaceAll(".", "");
  ret = ret.replaceAll(",", "");
  return ret;
};

const App = () => {
  const processUtteranceCallback = (utterance: string) => {
    const normalized = normalizeUtterance(utterance);
    const words = normalized.split(" ");

    console.log({ utterance, normalized, words });
    const piece = parsePiece(words[0]);
    if (!piece) {
      console.error("no such piece");
      return;
    }

    const square = parseSquare(words);
    if (!square) {
      console.error("No such square");
      return;
    }

    const legalMoves = chessState.moves({ verbose: true, piece });
    const plannedMove = legalMoves.find((move) => move.to === square);
    console.log({ words, piece, legalMoves, square, plannedMove });

    if (!plannedMove) {
      console.error("Not a legal move");
      return;
    }

    console.warn("making move", plannedMove);
    setChessState((previous) => {
      previous.move(plannedMove.san);
      return previous;
    });
  };
  const { isRecording, transcript, startRecording } = useLiveTranscription(
    processUtteranceCallback
  );
  const [chessState, setChessState] = useState<Chess>(new Chess());
  //console.log("latest state", chessState);

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
