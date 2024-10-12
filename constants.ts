import { PieceType, Positions } from "./types";

export const PIECE_COLORS: { [key in PieceType]: string } = {
  I: "#25AAE1",
  L: "#F68520",
  J: "#2657A7",
  O: "#F6D014",
  S: "#69BD45",
  T: "#7A3695",
  Z: "#AA1E22",
};

export const STARTING_POSITIONS: { [key in PieceType]: Positions } = {
  I: [
    { row: 1, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 5 },
    { row: 1, col: 6 },
  ],
  J: [
    { row: 1, col: 4 },
    { row: 0, col: 3 },
    { row: 1, col: 3 },
    { row: 1, col: 5 },
  ],
  L: [
    { row: 1, col: 4 },
    { row: 0, col: 5 },
    { row: 1, col: 3 },
    { row: 1, col: 5 },
  ],
  O: [
    { row: 0, col: 4 },
    { row: 0, col: 5 },
    { row: 1, col: 4 },
    { row: 1, col: 5 },
  ],
  S: [
    { row: 1, col: 4 },
    { row: 0, col: 4 },
    { row: 0, col: 5 },
    { row: 1, col: 3 },
  ],
  T: [
    { row: 1, col: 4 },
    { row: 0, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 5 },
  ],
  Z: [
    { row: 1, col: 4 },
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 5 },
  ],
};

export function getAttack(lines: number, tspin: boolean, pc?: boolean) {
  if (pc === true) return 10;

  if (lines === 1) {
    return tspin ? 2 : 0;
  } else if (lines === 2) {
    return tspin ? 4 : 1;
  } else if (lines === 3) {
    return tspin ? 6 : 2;
  } else {
    return 4;
  }
}

export const ATTACK_TABLE = {
  single: 0,
  double: 1,
  triple: 2,
  tetris: 4,
  "tspin-single": 2,
  "tspin-double": 4,
  "tspin-triple": 6,
  pc: 10,
};

export const TSPIN_TESTS = [
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 },
  { dx: 1, dy: -1 },
];

export const I_WALLKICKS = [
  {
    rotation: 0,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: -1, dy: -2 },
      { dx: 2, dy: 1 },
    ],
  },
  {
    rotation: 0,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -2, dy: 1 },
      { dx: 1, dy: -2 },
    ],
  },
  {
    rotation: 1,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 2, dy: -1 },
      { dx: -1, dy: 2 },
    ],
  },
  {
    rotation: 1,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: -1, dy: -2 },
      { dx: 2, dy: 1 },
    ],
  },
  {
    rotation: 2,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 1, dy: 2 },
      { dx: -2, dy: -1 },
    ],
  },
  {
    rotation: 2,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 2, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 2, dy: -1 },
      { dx: -1, dy: 2 },
    ],
  },
  {
    rotation: 3,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -2, dy: 1 },
      { dx: 1, dy: -2 },
    ],
  },
  {
    rotation: 3,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 1, dy: 2 },
      { dx: -2, dy: -1 },
    ],
  },
];

export const DEFAULT_WALLKICKS = [
  {
    rotation: 0,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 0, dy: 2 },
      { dx: -1, dy: 2 },
    ],
  },
  {
    rotation: 1,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 0, dy: -2 },
      { dx: 1, dy: -2 },
    ],
  },
  {
    rotation: 1,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: 1 },
      { dx: 0, dy: -2 },
      { dx: 1, dy: -2 },
    ],
  },
  {
    rotation: 2,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 0, dy: 2 },
      { dx: -1, dy: 2 },
    ],
  },
  {
    rotation: 2,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: -1 },
      { dx: 0, dy: 2 },
      { dx: 1, dy: 2 },
    ],
  },
  {
    rotation: 3,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: -2 },
      { dx: -1, dy: -2 },
    ],
  },
  {
    rotation: 3,
    direction: 1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: 1 },
      { dx: 0, dy: -2 },
      { dx: -1, dy: -2 },
    ],
  },
  {
    rotation: 0,
    direction: -1,
    tests: [
      { dx: 0, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 1, dy: -1 },
      { dx: 0, dy: 2 },
      { dx: 1, dy: 2 },
    ],
  },
];
