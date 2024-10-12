export default class Block {
  card: boolean;
  color: string;
  current: boolean;
  filled: boolean;

  constructor(card = false, color = "#fff", current = false, filled = false) {
    this.card = card;
    this.color = color;
    this.current = current;
    this.filled = filled;
  }
}
