import clone from "helpers/clone";
import { STARTING_POSITIONS } from "./constants";
import { PieceType, Positions } from "./types";

export default class Piece {
  buffer = 1;
  pieceType: PieceType;
  positions: Positions;
  rotation = 0;
  cardIndex = -1;

  constructor(pieceType: PieceType, buffer: number, card?: boolean) {
    this.buffer = buffer;
    this.pieceType = pieceType;
    this.positions = this.resetPositions();
    if (card === true) this.generateCard();
  }

  clonePositions(): Positions {
    return clone(this.positions);
  }

  generateCard(): void {
    this.cardIndex = Math.floor(Math.random() * this.positions.length);
    this.positions[this.cardIndex].card = true;
  }

  resetPositions(): Positions {
    this.positions = clone(STARTING_POSITIONS[this.pieceType]);
    this.positions.forEach((pos) => (pos.row += this.buffer - 1));

    // preserve card
    if (this.cardIndex != -1) this.positions[this.cardIndex].card = true;

    return this.positions;
  }
}
