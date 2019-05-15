"use strict";

const ShipFactory = (function() {
  class Ship {
    constructor(name, size) {
      this.name = name;
      this.health = size;
      this.alignment = "";
      this.hullBlocks = new Array(size).fill(null).map(() => ({
        // fill(null).map = set each ref to uniq object
        isHit: 0,
        x: 0,
        y: 0
      }));
    }

    setShipLocation(x, y, alignment) {
      this.alignment = alignment;
      if (alignment === "horizontal") {
        this.hullBlocks.forEach((block, i) => {
          block.x = x + i;
          block.y = y;
        });
      } else if ("vertical") {
        this.hullBlocks.forEach((block, i) => {
          block.x = x;
          block.y = y + i;
        });
      } else {
        console.log("Invalid alignment");
      }
    }
    isThereShip(x, y, attack) {
      let thereIs = false;
      this.hullBlocks.forEach(block => {
        if (block.x === x && block.y === y) {
          //overloaded
          if (attack !== undefined) {
            block.isHit = 1;
            this.health--;
          }
          thereIs = true;
        }
      });
      return thereIs;
    }
  }

  function createNewShips() {
    const _ships = [];
    _ships.push(new Ship("Curser", 4));
    _ships.push(new Ship("Destroyer1", 3));
    _ships.push(new Ship("Destroyer2", 3));
    return _ships;
  }
  //public
  return {
    getShips() {
      return createNewShips();
    }
  };
})();

const GameBoardFactory = (function() {
  class GameBoard {
    constructor(sizeX, sizeY) {
      this.sizeX = sizeX;
      this.sizeY = sizeY;
      //init board
      this.board = new Array(sizeX)
        .fill(null)
        .map(() => new Array(sizeY).fill(null).map(() => "."));
    }
    isPosInside(x, y) {
      let isXInside = x >= 0 && x < this.sizeX;
      let isYInside = y >= 0 && y < this.sizeY;
      return isXInside && isYInside;
    }
    markHit(x, y) {
      this.board[x][y] = "x";
    }
    markMiss(x, y) {
      this.board[x][y] = "-";
    }
  }

  return {
    newGameBoard(sizeX, sizeY) {
      return new GameBoard(10, 10);
    }
  };
})();

const FleetModel = (function() {
  class Fleet {
    constructor() {
      this.fleet = ShipFactory.getShips();
      this.battlefield = GameBoardFactory.newGameBoard();
      this.selectedShip = {};
    }
    selectShip(shipName) {
      this.selectedShip = this.fleet.find(ship => ship.name === shipName);
    }
    positionShip(x, y, alignment) {
      let isPosValidStart = false;
      let isPosValidEnd = false;
      let isNotColliding = true;

      //POSITION VALIDATION
      isPosValidStart = this.battlefield.isPosInside(x, y);
      if (alignment === "horizontal") {
        //Validate ship position on game board
        isPosValidEnd = this.battlefield.isPosInside(
          x + this.selectedShip.hullBlocks.length,
          y
        );
        //Validate ship overlapping
        this.fleet.forEach(ship => {
          for (let i = 0; i < ship.hullBlocks.length; i++) {
            if (ship.isThereShip(x + i, y)) {
              isNotColliding = false;
              break;
            }
          }
        });
      } else if (alignment === "vertical") {
        //Validate ship position on game board
        isPosValidEnd = this.battlefield.isPosInside(
          x,
          y + this.selectedShip.hullBlocks.length
        );
        //Validate ship overlapping
        this.fleet.forEach(ship => {
          for (let i = 0; i < ship.hullBlocks.length; i++) {
            if (ship.isThereShip(x, y + i)) {
              isNotColliding = false;
              break;
            }
          }
        });
      } else {
        console.log("Invalid alignment");
        return false;
      }

      //Set Ship position if valid
      if (isPosValidStart && isPosValidEnd && isNotColliding) {
        this.selectedShip.setShipLocation(x, y, alignment);
        return true;
      } else {
        return false;
      }
    }
    receiveAttack(x, y) {
      let shipIsHit = false;
      this.fleet.forEach(ship => {
        if (ship.isThereShip(x, y, "attack")) {
          shipIsHit = true;
          return;
        }
      });
      if (shipIsHit === true) {
        this.battlefield.markHit(x, y);
        return true;
      } else {
        this.battlefield.markMiss(x, y);
        return false;
      }
    }
  }

  return {
    newFleet() {
      return new Fleet();
    }
  };
})();

const UI = (function() {
  const canvas = document.querySelector(".canvas");

  function createBattlefield(battlefield, PlayerName) {
    const grid = document.createElement("table");
    grid.setAttribute("name", PlayerName);
    let row = {};
    let col = {};
    for (let y = 0; y < battlefield.sizeY; y++) {
      row = document.createElement("tr");
      for (let x = 0; x < battlefield.sizeY; x++) {
        col = document.createElement("td");
        col.innerHTML = ".";
        col.setAttribute("name", `${x}-${y}`);
        col.setAttribute("class", "location");

        row.append(col);
      }
      grid.append(row);
    }
    canvas.appendChild(grid);
  }
  function showFleet(fleet, PlayerName) {
    const grid = canvas.querySelector(`[name="${PlayerName}"]`);
    let td = {};
    let tdClass = {};
    fleet.forEach(ship => {
      ship.hullBlocks.forEach(block => {
        td = grid.querySelector(`[name="${block.x}-${block.y}"]`);
        tdClass = td.getAttribute("class");
        tdClass += " location-ship";
        td.setAttribute("class", tdClass);
      });
    });
  }
  function updateBattlefield(battlefield, PlayerName) {
    const grid = canvas.querySelector(`[name="${PlayerName}"]`);
    let tr = {};
    let td = {};
    let tdClass = "";
    for (let y = 0; y < battlefield.sizeY; y++) {
      tr = grid.children[y];
      for (let x = 0; x < battlefield.sizeX; x++) {
        td = tr.children[x];
        td.innerHTML = battlefield.board[x][y];
        if (battlefield.board[x][y] === "-") {
          tdClass = td.getAttribute("class");
          tdClass += " miss";
          td.setAttribute("class", tdClass);
        }
        if (battlefield.board[x][y] === "x") {
          tdClass = td.getAttribute("class");
          tdClass += " hit";
          td.setAttribute("class", tdClass);
        }
      }
    }
  }
  return {
    showFleet: showFleet,
    createBattlefield: createBattlefield,
    updateBattlefield: updateBattlefield
  };
})();

const PlayerCtrl = (function() {
  class Player {
    constructor(name) {
      this.name = name;
      this.command = FleetModel.newFleet();
      this.attackPosX = 0;
      this.attackPosY = 0;
    }
    getRandomPosX() {
      return Math.round(Math.random() * (this.command.battlefield.sizeX - 1));
    }
    getRandomPosY() {
      return Math.round(Math.random() * (this.command.battlefield.sizeY - 1));
    }
    generateRandomShipPosition() {
      let posX = 0;
      let posY = 0;
      let alignment = "";
      this.command.fleet.forEach(ship => {
        this.command.selectShip(ship.name);
        do {
          posX = this.getRandomPosX();
          posY = this.getRandomPosY();
          alignment = Math.round(Math.random() * 1) ? "horizontal" : "vertical";
        } while (!this.command.positionShip(posX, posY, alignment));
      });
    }
    play(attack) {
      attack(this.attackPosX, this.attackPosY);
    }
  }
  class AI extends Player {
    constructor(name) {
      super(name);
      this.history = [];
      this.attackWasHit = false;
      this.lastAttack = {};
      this.inSequence = false;
    }
    searchForSequence() {
      history.forEach(entry => {
        if (entry.isHit === true && entry !== this.lastAttack) {
          if (entry.posX) {
          }
        }
      });
    }
    isAttackUniq() {
      let isUniq = true;
      this.history.forEach(entry => {
        if (this.attackPosX === entry.posX && this.attackPosY === entry.posY) {
          isUniq = false;
        }
      });
      return isUniq;
    }
    generateAttack() {
      if (this.attackWasHit) {
        if (this.inSequence) {
          // continue sequence

          do {
            this.attackPosX = this.getRandomPosX();
            this.attackPosY = this.getRandomPosX();
          } while (!this.isAttackUniq());
        } else {
          //search for nearby hits

          do {
            this.attackPosX = this.getRandomPosX();
            this.attackPosY = this.getRandomPosX();
          } while (!this.isAttackUniq());
        }
      } else {
        do {
          this.attackPosX = this.getRandomPosX();
          this.attackPosY = this.getRandomPosX();
        } while (!this.isAttackUniq());
      }
    }
    play(attack) {
      this.attackWasHit = attack(this.attackPosX, this.attackPosY);
      this.lastAttack = {
        posX: this.attackPosX,
        posY: this.attackPosY,
        hit: this.attackWasHit
      };
      this.history.push(this.lastAttack);
    }
  }
  return {
    newPlayer(name) {
      return new Player(name);
    },
    newAI(name) {
      return new AI(name);
    }
  };
})();

(function GameController(FleetModel, UI, PlayerCtrl) {
  const playerHuman = PlayerCtrl.newPlayer("Human");
  playerHuman.generateRandomShipPosition();

  const playerPC = PlayerCtrl.newAI("PC");
  playerPC.generateRandomShipPosition();

  UI.createBattlefield(playerHuman.command.battlefield, playerHuman.name);
  UI.createBattlefield(playerPC.command.battlefield, playerPC.name);

  for (let i = 0; i < 50; i++) {
    playerPC.generateAttack();
    playerPC.play((x, y) => playerHuman.command.receiveAttack(x, y));
    UI.updateBattlefield(playerHuman.command.battlefield, playerHuman.name);
  }

  playerHuman.play((x, y) => playerPC.command.receiveAttack(x, y));

  UI.showFleet(playerHuman.command.fleet, playerHuman.name);
  UI.updateBattlefield(playerHuman.command.battlefield, playerHuman.name);
})(FleetModel, UI, PlayerCtrl);
