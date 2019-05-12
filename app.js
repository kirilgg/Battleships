"use strict";

const ShipFactory = (function() {
  //privet
  let _ships = [];
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

  _ships.push(new Ship("Curser", 4));
  _ships.push(new Ship("Destroyer1", 3));
  _ships.push(new Ship("Destroyer2", 3));

  //public
  return {
    getShips() {
      return _ships;
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

  let _board = new GameBoard(10, 10);

  return {
    newGameBoard(sizeX, sizeY) {
      return _board;
    }
  };
})();

const FleetFactory = (function() {
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
  let _fleetcommand = new Fleet();
  _fleetcommand.selectShip("Curser");
  _fleetcommand.positionShip(4, 3, "horizontal");
  _fleetcommand.selectShip("Destroyer1");
  console.log(_fleetcommand.positionShip(4, 4, "vertical"));
  //_fleetcommand.receiveAttack(5, 3);
  console.log(_fleetcommand.receiveAttack(5, 3));
  console.log(_fleetcommand.battlefield);
})();

console.log("///////////////////////////////////////////");
const ships = ShipFactory.getShips();
console.log(ships);
const battlefield = GameBoardFactory.newGameBoard();
console.log(battlefield);
console.log("///////////////////////////////////////////");
