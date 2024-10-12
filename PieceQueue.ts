import Piece from "./Piece";
import { PieceType } from "./types";

/**
 * Utilizes 7-bag (cycle each piece once before new cycle).
 * Last index of current bag represents next piece in queue
 */
export default class PieceQueue {
  buffer: number;
  currBag: Piece[];
  nextBag: Piece[];
  cardWait = 7;
  cardFrequency = 7;

  constructor(buffer: number) {
    this.buffer = buffer;
    this.currBag = this.generateBag();
    this.nextBag = this.generateBag();
  }

  public pop() {
    const top = this.currBag.pop();

    // safety check
    if (top == undefined) return this.generateRandomPiece();

    let next = this.nextBag.pop();

    // safety check
    if (next == undefined) this.currBag.unshift(this.generateRandomPiece());

    // replenish current bag after being popped
    else this.currBag.unshift(next);

    // prepare next bag if next bag is empty
    if (this.nextBag.length === 0) this.nextBag = this.generateBag();

    return top;
  }

  public reset() {
    this.currBag = this.generateBag();
    this.nextBag = this.generateBag();
  }

  private generateBag() {
    // initialize bag
    const bag: PieceType[] = ["I", "J", "L", "O", "S", "T", "Z"];

    // return a randomly shuffled bag
    this.shuffle(bag);

    return bag.map((pieceType) => {
      this.cardWait--;
      this.cardWait = (this.cardWait + this.cardFrequency) % this.cardFrequency;
      
      return new Piece(pieceType, this.buffer, this.cardWait === 0);
    });
  }

  private shuffle<T>(a: Array<T>) {
    var currentIndex = a.length;

    while (currentIndex != 0) {
      var randomIndex = Math.floor(Math.random() * currentIndex--);

      [a[currentIndex], a[randomIndex]] = [a[randomIndex], a[currentIndex]];
    }

    return a;
  }

  private generateRandomPiece() {
    const bag: PieceType[] = ["I", "J", "L", "O", "S", "T", "Z"];
    const pieceType = bag[Math.floor(Math.random() * bag.length)];

    this.cardWait--;
    this.cardWait = (this.cardWait + this.cardFrequency) % this.cardFrequency;
    return new Piece(pieceType, this.buffer, this.cardWait === 0);
  }
}
