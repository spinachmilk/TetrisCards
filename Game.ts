import React from "react";

import * as constants from "./constants";
import clone from "helpers/clone";

import Block from "./Block";
import Piece from "./Piece";
import PieceQueue from "./PieceQueue";
import Controls from "./Controls";
import GameDrawer from "./Drawer";

import { GameConstructorArgs } from "./types";
import { Positions } from "./types";

export default class Game {
  // dimensions of board
  public buffer: number;
  public height: number;
  public width: number;

  // game states
  public board: Block[][];
  private filledSlots: number[];
  public currentPiece: Piece;
  public heldPiece?: Piece;
  public queue: PieceQueue;

  private gameOver = true;
  private backToBack = false;
  private combo = 0;
  private testPiece: Positions;
  private tspin = false;

  // controls
  private controls: Controls;

  // renderer
  private drawer?: GameDrawer;
  private emitSendLines?: (lines: number) => void;
  private emitSendBoard?: (board: Block[][]) => void;
  private emitGameOver?: () => void;

  handleShowCard: () => any;
  propsSetPaused?: React.Dispatch<React.SetStateAction<boolean>>;
  propsSetGameOver?: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(props: GameConstructorArgs) {
    this.buffer = props.buffer ?? 3;
    this.height = props.height ?? 20;
    this.width = props.width ?? 10;

    this.board = this.generateBoard(this.width, this.height, this.buffer);
    this.controls = new Controls(this);
    this.filledSlots = Array(this.height + this.buffer).fill(0);
    this.queue = new PieceQueue(this.buffer);
    this.currentPiece = this.queue.pop();
    this.testPiece = this.currentPiece.clonePositions();

    // broadcasters
    this.emitSendLines = props.emitSendLines;
    this.emitSendBoard = props.emitSendBoard;
    this.emitGameOver = props.emitGameOver;

    // ui
    this.handleShowCard = props.handleShowCard;
    this.propsSetPaused = props.setPaused;
    this.propsSetGameOver = props.setGameOver;
  }

  public updateSettings() {
    this.controls.updateSettings();
  }

  public setDrawer(drawer: GameDrawer) {
    this.drawer = drawer;
  }

  public initListeners() {
    this.drawer?.boardCanvas.addEventListener(
      "keydown",
      this.controls.handleKeyDown
    );
    this.drawer?.boardCanvas.addEventListener(
      "keyup",
      this.controls.handleKeyUp
    );

    this.controls.startGravity();
  }

  public removeListeners() {
    this.drawer?.boardCanvas.removeEventListener(
      "keydown",
      this.controls.handleKeyDown
    );
    this.drawer?.boardCanvas.removeEventListener(
      "keyup",
      this.controls.handleKeyUp
    );

    this.controls.stopGravity();
  }

  private generateRow(width: number = 10) {
    return Array.from({ length: width }, () => new Block());
  }

  private generateBoard(width = 10, height = 20, buffer = 0) {
    return Array.from({ length: height + buffer }, () =>
      this.generateRow(width)
    );
  }

  // TODO: Add messiness to garbage
  private generateGarbage(lines: number = 1): Block[][] {
    var freeBlockIdx = Math.floor(Math.random() * this.width);
    var garbageRow = this.generateRow();

    garbageRow.forEach((block, blockIdx) => {
      if (blockIdx != freeBlockIdx) {
        block.card = false;
        block.color = "#555";
        block.current = false;
        block.filled = true;
      }
    });

    return Array(lines).fill(garbageRow);
  }

  public move(drow: number, dcol: number, checkL3 = false): boolean {
    // clone current positions and add changes
    this.testPiece = this.currentPiece.clonePositions();

    this.testPiece.forEach((position) => {
      position.row += drow;
      position.col += dcol;
    });

    const valid = this.updateCurrentPiecePositions(this.testPiece);

    if (checkL3 && drow === 1 && !valid && this.controls.l3Active) {
      this.hardDrop();
      console.log("l3");
    }

    return valid;
  }

  public hardDrop(): void {
    while (this.move(1, 0));

    for (const { row } of this.currentPiece.positions) {
      this.filledSlots[row] += 1;
    }

    this.controls.resetL3();
    this.clearRows();
    this.nextPiece();
  }

  public rotate(direction: 1 | -1): boolean {
    if (this.currentPiece.pieceType === "O") return false;

    // prepare new rotation value
    const newRotationValue = (this.currentPiece.rotation + direction + 4) % 4;

    // set pivot points
    var x = this.currentPiece.positions[0].row;
    var y = this.currentPiece.positions[0].col;

    // Rotation logic
    this.currentPiece.positions.forEach(({ row, col, card }, i) => {
      this.testPiece[i].card = card;
      this.testPiece[i].row = direction === 1 ? col - y + x : -(col - x) + y;
      this.testPiece[i].col = direction === 1 ? -(row - x) + y : row - x + y;

      if (this.currentPiece.pieceType === "I") {
        if (this.currentPiece.rotation === 0) {
          this.testPiece[i].col += direction;
        } else if (this.currentPiece.rotation === 1) {
          this.testPiece[i].row += direction;
        } else if (this.currentPiece.rotation === 2) {
          this.testPiece[i].col -= direction;
        } else {
          this.testPiece[i].row -= direction;
        }
      }
    });

    // Update positions and rotation value
    if (
      !this.updateCurrentPiecePositions(this.testPiece) &&
      !this.wallKick(this.testPiece, direction)
    ) {
      return false;
    } else {
      this.currentPiece.rotation = newRotationValue;

      this.tspin =
        this.currentPiece.pieceType === "T" &&
        this.isTspin(x, y, this.currentPiece.rotation);

      return true;
    }
  }

  public hold(): void {
    // erase current positions from board
    this.currentPiece.positions.forEach(({ row, col }) => {
      this.board[row][col].card = false;
      this.board[row][col].current = false;
      this.board[row][col].filled = false;
    });
    this.currentPiece.resetPositions();

    // swap held piece and current piece
    const nextPiece = this.heldPiece;
    this.heldPiece = this.currentPiece;
    this.nextPiece(nextPiece);

    this.controls.canHold = false;
    this.drawer?.drawHeld();
  }

  private wallKick(positions: Positions, direction: 1 | -1): boolean {
    const { pieceType, rotation } = this.currentPiece;

    // search for data matching the current rotation and given direction
    const wallkick = (
      pieceType === "I" ? constants.I_WALLKICKS : constants.DEFAULT_WALLKICKS
    ).find((k) => k.rotation === rotation && k.direction === direction);

    // safety check
    if (wallkick === undefined) return false;

    for (const test of wallkick.tests) {
      const temp = clone(positions);

      temp.forEach((position) => {
        position.row += test.dy;
        position.col += test.dx;
      });

      if (this.updateCurrentPiecePositions(temp)) {
        return true;
      }
    }

    return false;
  }

  private isTspin(x1: number, y1: number, rotation: number): boolean {
    const x2 = this.currentPiece.positions[0].row;
    const y2 = this.currentPiece.positions[0].col;

    const front = [
      constants.TSPIN_TESTS[(rotation + 2) % 4],
      constants.TSPIN_TESTS[(rotation + 3) % 4],
    ].filter((test) =>
      this.isCollided([{ row: y2 + test.dy, col: x2 + test.dx }])
    ).length;

    const back = [
      constants.TSPIN_TESTS[rotation],
      constants.TSPIN_TESTS[(rotation + 1) % 4],
    ].filter((test) =>
      this.isCollided([{ row: y2 + test.dy, col: x2 + test.dx }])
    ).length;

    if (front === 2 && back >= 1) {
      return true;
    } else if (front === 1 && back === 2) {
      return x2 - x1 + (y2 - y1) === 2 ? true : false;
    } else {
      return false;
    }
  }

  private clearRows(): void {
    var clearedRows: number[] = [];
    var showCard: boolean = false;

    // remove full rows and add new, empty ones
    for (let rowIdx = 0; rowIdx < this.board.length; rowIdx++) {
      if (this.filledSlots[rowIdx] === this.width) {
        clearedRows.push(rowIdx);
        showCard = showCard || this.board[rowIdx].some((block) => block.card);

        this.board.splice(rowIdx, 1);
        this.board.unshift(this.generateRow());

        this.filledSlots.splice(rowIdx, 1);
        this.filledSlots.unshift(0);

        this.currentPiece.positions.forEach((position) => {
          if (position.row < rowIdx) position.row++;
        });
      }
    }

    // update combo count
    this.combo = clearedRows.length === 0 ? 0 : this.combo + 1;

    // check to avoid unnecessary logic
    if (clearedRows.length === 0) return;

    // if (this.emitSendLines !== undefined) {
    //   this.emitSendLines(
    //     constants.getAttack(
    //       clearedRows.length,
    //       this.tspin,
    //       this.board.every((row) => row.every((block) => !block.filled))
    //     )
    //   );
    // }

    showCard && this.handleShowCard();
  }

  public receiveLines(lines: number) {
    console.log(`Received ${lines} lines.`);

    const gameOver = this.filledSlots[lines + this.buffer - 1] > 0;

    // "erase" current piece from board and redraw later
    for (const { row, col } of this.currentPiece.positions) {
      this.board[row][col].filled = false;
      this.board[row][col].current = false;
      this.board[row][col].color = "#fff";
      this.board[row][col].card = false;
    }

    // add garbage to end of board
    this.board.splice(0, lines);
    this.board.push(...this.generateGarbage(lines));

    this.filledSlots.splice(0, lines);
    this.filledSlots.push(...Array(lines).fill(9));

    // current piece may get overridden by garbage, so put it on top of garbage
    while (this.isCollided(this.currentPiece.positions)) {
      for (const pos of this.currentPiece.positions) pos.row--;
    }

    // redraw current piece
    for (const { row, col, card } of this.currentPiece.positions) {
      this.board[row][col].filled = true;
      this.board[row][col].current = true;
      this.board[row][col].color =
        constants.PIECE_COLORS[this.currentPiece.pieceType];
      this.board[row][col].card = card ?? false;
    }

    this.drawAndSendBoard();
  }

  private updateCurrentPiecePositions(newPositions: Positions) {
    if (this.isCollided(newPositions)) {
      return false;
    }

    // erase current positions from board
    this.currentPiece.positions.forEach(({ row, col }) => {
      this.board[row][col].card = false;
      this.board[row][col].current = false;
      this.board[row][col].filled = false;
    });

    // add new positions to board
    newPositions.forEach(({ row, col, card }) => {
      this.board[row][col].card = card === true;
      this.board[row][col].color =
        constants.PIECE_COLORS[this.currentPiece.pieceType];
      this.board[row][col].current = true;
      this.board[row][col].filled = true;
    });

    // update current piece
    this.currentPiece.positions = clone(newPositions);
    this.tspin = false;

    // draw new board
    this.drawAndSendBoard();

    return true;
  }

  /**
   * Sets the current piece to the next piece in the queue, or the parameter if provided.
   *
   * If there is no space for next piece, this calls {@link setGameOver()}. Else, board is redrawn.
   *
   * @param nextPiece the next piece to appear. Grabbed from queue if undefined.
   */
  private nextPiece(nextPiece?: Piece) {
    // set "current" property of current piece to false
    this.currentPiece.positions.forEach(
      ({ row, col }) => (this.board[row][col].current = false)
    );

    // update current piece
    this.currentPiece = nextPiece ?? this.queue.pop();
    if (this.isCollided(this.currentPiece.positions)) {
      this.currentPiece.positions.forEach((pos) => {
        pos.row--;
      });

      if (this.isCollided(this.currentPiece.positions)) {
        this.setGameOver(true);
      }
    }
    this.updateCurrentPiecePositions(this.currentPiece.positions);

    // reset gravity and hold for new piece
    this.controls.stopGravity();
    this.controls.startGravity();
    this.controls.canHold = true;

    // draw new board
    this.drawAndSendBoard();
    this.drawer?.drawQueue();
  }

  public isCollided(positions: Positions) {
    for (const { row, col } of positions) {
      // check for out of bounds
      if (row >= this.board.length || col >= this.board[row].length || col < 0)
        return true;

      // check for overlapping blocks
      if (this.board[row][col].filled && !this.board[row][col].current)
        return true;
    }

    return false;
  }

  public reset() {
    // Reset current piece
    this.queue.reset();
    this.currentPiece = this.queue.pop();
    this.testPiece = this.currentPiece.clonePositions();
    this.heldPiece = undefined;

    // Reset board
    this.board.forEach((row) => {
      row.forEach((cell) => {
        cell.card = false;
        cell.current = false;
        cell.filled = false;
      });
    });

    this.updateCurrentPiecePositions(this.currentPiece.positions);

    // Reset filled slots
    this.filledSlots = Array(this.height + this.buffer).fill(0);

    this.setGameOver(false);
    this.setPaused(true);
    this.setPaused(false);
  }

  // Global game states
  public setPaused(paused: boolean, seconds: number = 3) {
    if (paused === true) {
      this.controls.pause();
      this.drawAll();
    } else {
      this.controls.unpause(seconds);
    }

    this.propsSetPaused !== undefined && this.propsSetPaused(paused);
  }

  public isPaused() {
    return this.controls.paused;
  }

  private setGameOver(gameOver: boolean) {
    this.gameOver = gameOver;
    gameOver && this.controls.pause();
    this.drawAll();
    this.emitGameOver && this.emitGameOver();
  }

  public isGameOver() {
    return this.gameOver;
  }

  // Drawers
  public drawAll() {
    this.drawer?.drawBoard();
    this.drawer?.drawQueue();
    this.drawer?.drawHeld();
  }

  public drawNumber(num: number) {
    this.drawer?.drawBoard();
    this.drawer?.drawNumber(num);
  }

  private drawAndSendBoard() {
    this.drawer?.drawBoard();
    this.emitSendBoard && this.emitSendBoard(this.board.slice(this.buffer));
  }
}
