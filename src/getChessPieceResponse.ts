import { PieceSymbol } from "chess.js";
import { Configuration, OpenAIApi } from "openai";

const PieceSymbolToName = {
  k: "king",
  q: "queen",
  b: "bishop",
  n: "knight",
  r: "rook",
  p: "pawn",
} satisfies Record<PieceSymbol, string>;
type PieceSymbolToNameType = typeof PieceSymbolToName;

export type MoveQuality = "Great" | "Good" | "Ok" | "Mistake" | "Blunder";
export type ChessSetRace = "zerg" | "pirate";
export type ChessPieceType = PieceSymbolToNameType[keyof PieceSymbolToNameType];

export type MoveDescription = {
  quality: MoveQuality;
  ownRace: ChessSetRace;
  enemyRace: ChessSetRace;
  isPlayerTrusted: boolean;
  chessPieceType: PieceSymbol;
};

const FluffByRace: Record<ChessSetRace, string> = {
  pirate:
    "As a pirate you should speak like a real pirate would, who is flying the black flag and is a menace on the seas with his cutlass",
  zerg: "As part of the zerg hivemind you should speak in the name of the whole hive and trust in your numbers",
};

const generatePromptForMove = (move: MoveDescription) => {
  const trust = move.isPlayerTrusted
    ? "You trust the player giving you instructions"
    : "";
  return `You are a chess piece in a game of magic chess. ${trust}.
You are a ${move.ownRace}. ${
    FluffByRace[move.ownRace]
  }. You're against a group of ${move.enemyRace}.
Your commander just made a ${
    move.quality
  } move. What do you say before following his command? Make it as short as possible, just a short sentence.`;
};

const getPromptAnswer = async (prompt: string): Promise<string> => {
  const configuration = new Configuration({
    organization: import.meta.env.VITE_OPENAI_ORG_ID,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const result = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 100,
  });
  return result.data.choices[0].text || "Fail";
};

export const getChessPieceResponse = async (
  move: MoveDescription
): Promise<string> => {
  const prompt = generatePromptForMove(move);
  return getPromptAnswer(prompt);
};
