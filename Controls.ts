import Game from "./Game";

export default class Controls {
  private game: Game;

  private heldKeys: { [key: string]: boolean };
  private settings = {
    "Move left": localStorage.getItem("Move left") ?? "ArrowLeft",
    "Move right": localStorage.getItem("Move right") ?? "ArrowRight",
    "Soft drop": localStorage.getItem("Soft drop") ?? "ArrowDown",
    "Hard drop": localStorage.getItem("Hard drop") ?? " ",
    "Rotate clockwise": localStorage.getItem("Rotate clockwise") ?? "ArrowUp",
    "Rotate counterclockwise":
      localStorage.getItem("Rotate counterclockwise") ?? "z",
    "Hold piece": localStorage.getItem("Hold piece") ?? "Shift",
  };

  // Game states
  public canHold = true;
  public paused = true;
  public shouldPauseTimer = false;

  private pauseTimeout?: number;

  // Auto-input (soft drop, DAS, ARR)
  private autoDropTimer?: number;
  private dropDelay: number;

  private autoShiftTimer?: number;
  private dasDelay: number = 100;
  private arrDelay: number = 25;

  // Auto-lock delays
  private l1Delay = 500;
  private l2Delay = 5000;
  private l3Delay = 20000;

  private l1Timer?: number;
  private l2Timer?: number;

  public l3Active: boolean = false;

  // Gravity
  private gravityTimer?: number;

  constructor(game: Game) {
    this.game = game;
    this.heldKeys = {};

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.autoShift = this.autoShift.bind(this);
    this.autoDrop = this.autoDrop.bind(this);
    this.gravity = this.gravity.bind(this);

    this.clearL1 = this.clearL1.bind(this);
    this.startL1 = this.startL1.bind(this);
    this.clearL2 = this.clearL2.bind(this);
    this.startL2 = this.startL2.bind(this);
    this.resetL3 = this.resetL3.bind(this);

    this.dropDelay = JSON.parse(localStorage.getItem("Drop delay") ?? "50");
    this.arrDelay = JSON.parse(localStorage.getItem("Arr delay") ?? "25");
    this.dasDelay = JSON.parse(localStorage.getItem("Das delay") ?? "100");

    if (isNaN(this.dropDelay)) {
      this.dropDelay = 50;
    }
    if (isNaN(this.arrDelay)) {
      this.arrDelay = 25;
    }
    if (isNaN(this.dasDelay)) {
      this.arrDelay = 100;
    }
  }

  public handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    if (event.repeat || this.paused) return;

    this.heldKeys[event.key] = true;

    var resetAutoShift = false;
    var resetAutoDrop = false;

    switch (event.key) {
      case this.settings["Hard drop"]: {
        this.game.hardDrop();
        resetAutoShift = true;
        break;
      }
      case this.settings["Soft drop"]: {
        if (!this.game.move(1, 0)) {
          this.startL1();
          this.startL2();
        }
        resetAutoDrop = true;
        break;
      }
      case this.settings["Move left"]: {
        if (this.game.move(0, -1)) {
          this.clearL1();
        }
        resetAutoShift = true;
        break;
      }
      case this.settings["Move right"]: {
        if (this.game.move(0, 1)) {
          this.clearL1();
        }
        resetAutoShift = true;
        break;
      }
      case this.settings["Rotate clockwise"]: {
        if (this.game.rotate(1)) {
          this.clearL1();
          this.clearL2();
        }
        break;
      }
      case this.settings["Hold piece"]: {
        if (this.canHold) {
          this.game.hold();
        }
        break;
      }
      case this.settings["Rotate counterclockwise"]: {
        if (this.game.rotate(-1)) {
          this.clearL1();
          this.clearL2();
        }
        break;
      }
      default: {
        break;
      }
    }

    if (resetAutoDrop) {
      this.autoDropTimer = window.setTimeout(this.autoDrop, this.dropDelay);
    }

    if (resetAutoShift) {
      window.clearTimeout(this.autoShiftTimer);
      this.autoShiftTimer = window.setTimeout(this.autoShift, this.dasDelay);
    }
  }

  public handleKeyUp(event: KeyboardEvent) {
    this.heldKeys[event.key] = false;
  }

  public startGravity() {
    if (this.gravityTimer != undefined) return;

    this.gravityTimer = window.setInterval(this.gravity, 1000);
  }

  public stopGravity() {
    window.clearInterval(this.gravityTimer);
    this.gravityTimer = undefined;
  }

  public pause() {
    this.clearL1();
    this.clearL2();
    this.heldKeys = {};
    clearTimeout(this.pauseTimeout);
    this.pauseTimeout = undefined;
    this.paused = true;
  }

  public unpause(seconds: number) {
    if (seconds <= 0) {
      this.paused = false;
      this.game.drawAll();
    } else {
      this.game.drawNumber(seconds);
      this.pauseTimeout = window.setTimeout(
        () => this.unpause(seconds - 1),
        800
      );
    }
  }

  public resetL3() {
    this.l3Active = false;
    this.clearL1();
    this.clearL2();

    window.setTimeout(() => (this.l3Active = true), this.l3Delay);
  }

  public updateSettings() {
    this.settings["Move left"] =
      localStorage.getItem("Move left") ?? "ArrowLeft";
    this.settings["Move right"] =
      localStorage.getItem("Move right") ?? "ArrowRight";
    this.settings["Soft drop"] =
      localStorage.getItem("Soft drop") ?? "ArrowDown";
    this.settings["Hard drop"] = localStorage.getItem("Hard drop") ?? " ";
    this.settings["Rotate clockwise"] =
      localStorage.getItem("Rotate clockwise") ?? "ArrowUp";
    this.settings["Rotate counterclockwise"] =
      localStorage.getItem("Rotate counterclockwise") ?? "z";
    this.settings["Hold piece"] = localStorage.getItem("Hold piece") ?? "Shift";

    this.dropDelay = JSON.parse(localStorage.getItem("Drop delay") ?? "50");
    this.arrDelay = JSON.parse(localStorage.getItem("Arr delay") ?? "25");
    this.dasDelay = JSON.parse(localStorage.getItem("Das delay") ?? "100");

    if (isNaN(this.dropDelay)) {
      this.dropDelay = 50;
    }
    if (isNaN(this.arrDelay)) {
      this.arrDelay = 25;
    }
    if (isNaN(this.dasDelay)) {
      this.arrDelay = 100;
    }
  }

  private clearL1() {
    window.clearTimeout(this.l1Timer);
    this.l1Timer = undefined;
  }

  private startL1() {
    if (this.l1Timer === undefined) {
      this.l1Timer = window.setTimeout(() => {
        this.clearL1();
        this.game.hardDrop();
        console.log("l1");
      }, this.l1Delay);
    }
  }

  private clearL2() {
    window.clearTimeout(this.l2Timer);
    this.l2Timer = undefined;
  }

  private startL2() {
    if (this.l2Timer === undefined) {
      this.l2Timer = window.setTimeout(() => {
        this.clearL2();
        this.game.hardDrop();
        console.log("l2");
      }, this.l2Delay);
    }
  }

  private autoDrop() {
    if (this.paused) return;

    if (this.heldKeys[this.settings["Soft drop"]] && !this.game.move(1, 0)) {
      this.startL1();
      this.startL2();
    }

    if (this.heldKeys[this.settings["Soft drop"]]) {
      this.autoDropTimer = window.setTimeout(this.autoDrop, this.dropDelay);
    } else {
      window.clearTimeout(this.autoDropTimer);
    }
  }

  private autoShift() {
    if (
      !this.heldKeys[this.settings["Move left"]] &&
      !this.heldKeys[this.settings["Move right"]] &&
      this.paused
    ) {
      window.clearTimeout(this.autoShiftTimer);
    } else {
      if (this.heldKeys[this.settings["Move left"]] && this.game.move(0, -1)) {
        this.clearL1();
      }
      if (this.heldKeys[this.settings["Move right"]] && this.game.move(0, 1)) {
        this.clearL1();
      }

      this.autoShiftTimer = window.setTimeout(this.autoShift, this.arrDelay);
    }
  }

  private gravity() {
    if (this.paused) return;

    if (!this.game.move(1, 0, true) && this.l2Timer === undefined) {
      this.game.hardDrop();
      console.log("gravity");
    }
  }
}
