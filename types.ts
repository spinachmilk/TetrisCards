import Block from "./Block";
import Game from "./Game";

export type PieceType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export type Positions = {
  row: number;
  col: number;
  card?: boolean;
}[];

export type GameConstructorArgs = {
  width?: number;
  height?: number;
  buffer?: number;
  handleShowCard: () => any;
  setPaused?: React.Dispatch<React.SetStateAction<boolean>>;
  setGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
  emitSendLines?: (lines: number) => void;
  emitSendBoard?: (board: Block[][]) => void;
  emitGameOver?: () => void;
};

export type GameDrawerArgs = {
  game: Game;
  boardCanvas: HTMLCanvasElement;
  boardCtx: CanvasRenderingContext2D;
  queueCanvas: HTMLCanvasElement;
  queueCtx: CanvasRenderingContext2D;
  holdCanvas: HTMLCanvasElement;
  holdCtx: CanvasRenderingContext2D;
};
