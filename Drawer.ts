import * as constants from "./constants";

import Game from "./Game";

import { GameDrawerArgs } from "./types";

export default class GameDrawer {
  private game: Game;

  boardCanvas: HTMLCanvasElement;
  boardCtx: CanvasRenderingContext2D;
  queueCanvas: HTMLCanvasElement;
  queueCtx: CanvasRenderingContext2D;
  holdCanvas: HTMLCanvasElement;
  holdCtx: CanvasRenderingContext2D;

  constructor(props: GameDrawerArgs) {
    this.game = props.game;
    this.boardCanvas = props.boardCanvas;
    this.boardCtx = props.boardCtx;
    this.queueCanvas = props.queueCanvas;
    this.queueCtx = props.queueCtx;
    this.holdCanvas = props.holdCanvas;
    this.holdCtx = props.holdCtx;

    this.game.setDrawer(this);
  }

  private clearCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private setDesign(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f6f7fb";
  }

  drawBoard() {
    this.clearCanvas(this.boardCtx, this.boardCanvas);

    const block_w = this.boardCanvas.width / this.game.board[0].length;
    const block_h =
      this.boardCanvas.height / (this.game.board.length - this.game.buffer);

    for (let i = this.game.buffer - 1; i < this.game.board.length; i++) {
      for (let j = 0; j < this.game.board[i].length; j++) {
        if (!this.game.board[i][j].filled) continue;

        const x = j * block_w;
        const y = (i - this.game.buffer) * block_h;
        const w = block_w;
        const h = block_h;
        const fill = this.game.isGameOver()
          ? "#dddddd"
          : this.game.board[i][j].color;

        this.setDesign(this.boardCtx);
        this.boardCtx.fillStyle = fill;
        this.boardCtx.beginPath();
        this.boardCtx.roundRect(x, y, w, h, 4);
        this.boardCtx.fill();
        this.boardCtx.stroke();
        this.boardCtx.closePath();

        if (this.game.board[i][j].card) {
          this.boardCtx.shadowBlur = 0;
          this.boardCtx.beginPath();
          this.boardCtx.strokeStyle = "black";
          this.boardCtx.arc(
            x + block_w / 2,
            y + block_h / 2,
            4,
            0,
            2 * Math.PI
          );
          this.boardCtx.stroke();
          this.boardCtx.closePath();
        }
      }
    }

    this.drawGhost(block_w, block_h);
  }

  drawGhost(block_w: number, block_h: number) {
    const ghostPiece = this.game.currentPiece.clonePositions();
    while (!this.game.isCollided(ghostPiece)) {
      ghostPiece.forEach((pos) => pos.row++);
    }
    ghostPiece.forEach((pos) => pos.row--);
    ghostPiece.forEach(({ row, col, card }) => {
      const fill = (this.boardCtx.fillStyle = this.game.isGameOver()
        ? "#ddddddaa"
        : `${constants.PIECE_COLORS[this.game.currentPiece.pieceType]}aa`);
      const x = col * block_w;
      const y = (row - this.game.buffer) * block_h;
      const w = block_w;
      const h = block_h;

      this.setDesign(this.boardCtx);
      this.boardCtx.fillStyle = fill;
      this.boardCtx.beginPath();
      this.boardCtx.roundRect(x, y, w, h, 4);
      this.boardCtx.fill();
      this.boardCtx.stroke();
      this.boardCtx.closePath();

      if (card) {
        this.boardCtx.shadowBlur = 0;
        this.boardCtx.beginPath();
        this.boardCtx.strokeStyle = "000000";
        this.boardCtx.arc(x + block_w / 2, y + block_h / 2, 4, 0, 2 * Math.PI);
        this.boardCtx.stroke();
        this.boardCtx.closePath();
      }
    });
  }

  drawNumber(num?: number) {
    if (num === undefined || isNaN(num)) return;

    this.boardCtx.beginPath();
    this.boardCtx.rect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
    this.boardCtx.fillStyle = "rgb(0,0,0,0.5)";
    this.boardCtx.fill();
    this.boardCtx.closePath();

    const fontSize = this.boardCanvas.height / 3;
    this.boardCtx.font = `${fontSize}px Lexend Deca, sans-serif`;
    this.boardCtx.fillStyle = "white";
    this.boardCtx.textAlign = "center";
    this.boardCtx.textBaseline = "middle";
    this.boardCtx.fillText(
      num.toString(),
      this.boardCanvas.width / 2,
      this.boardCanvas.height / 2
    );
  }

  drawQueue(show_max = 5) {
    this.clearCanvas(this.queueCtx, this.queueCanvas);

    const block_w = this.queueCanvas.width / 6;
    const block_h = this.queueCanvas.height / 16;

    const start = Math.max(0, this.game.queue.currBag.length - show_max);

    for (let i = start; i < this.game.queue.currBag.length; i++) {
      const piece = this.game.queue.currBag[i];

      for (const { row, col, card } of piece.positions) {
        // height differential needed for the ith piece
        const dy = (i + 1 - start) * 3 - row + 2;

        const x = (col - 2) * block_w;
        const y = this.queueCanvas.height - block_h * dy;
        const w = block_w;
        const h = block_h;

        // draw block
        this.setDesign(this.queueCtx);
        this.queueCtx.fillStyle = this.game.isGameOver()
          ? "#dddddd"
          : constants.PIECE_COLORS[piece.pieceType];
        this.queueCtx.beginPath();
        this.queueCtx.roundRect(x, y, w, h, 4);
        this.queueCtx.fill();
        this.queueCtx.stroke();
        this.queueCtx.closePath();

        if (card) {
          this.queueCtx.beginPath();
          this.queueCtx.strokeStyle = "black";
          this.queueCtx.arc(
            (col - 1.5) * block_w,
            this.queueCanvas.height - block_h * (dy - 0.5),
            4,
            0,
            2 * Math.PI
          );
          this.queueCtx.stroke();
          this.queueCtx.closePath();
        }
      }
    }
  }

  drawHeld() {
    this.clearCanvas(this.holdCtx, this.holdCanvas);

    const block_w = this.holdCanvas.width / 6;
    const block_h = this.holdCanvas.height / 4;

    if (this.game.heldPiece === undefined) return;

    for (const { row, col, card } of this.game.heldPiece.positions) {
      const x = (col - 2) * block_w;
      const y = (row - 1) * block_h;
      const w = block_w;
      const h = block_h;

      this.holdCtx.fillStyle = this.queueCtx.fillStyle = this.game.isGameOver()
        ? "#dddddd"
        : constants.PIECE_COLORS[this.game.heldPiece.pieceType];

      this.setDesign(this.holdCtx);
      this.holdCtx.beginPath();
      this.holdCtx.roundRect(x, y, w, h, 4);
      this.holdCtx.fill();
      this.holdCtx.stroke();
      this.holdCtx.closePath();

      if (card) {
        this.holdCtx.beginPath();
        this.holdCtx.strokeStyle = "#333333";
        this.holdCtx.arc(
          (col - 1.5) * block_w,
          (row - 0.5) * block_h,
          4,
          0,
          2 * Math.PI
        );
        this.holdCtx.stroke();
        this.holdCtx.closePath();
      }
    }
  }
}
