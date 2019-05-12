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
    isHit(x, y) {
      this.hullBlocks.forEach(block => {
        if (block.x === x && block.y === y) {
          block.isHit = 1;
          this.health--;
        } else {
          return false;
        }
      });
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
      //init bord
      this.board = new Array(sizeX)
        .fill(null)
        .map(() => new Array(sizeY).fill(null).map(() => "."));
    }
    isPosInside(x, y) {
      let isXInside = x >= 0 && x < this.sizeX;
      let isYInside = y >= 0 && y < this.sizeY;
      return isXInside && isYInside;
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

      //Validate ship position on game board
      if (alignment === "horizontal") {
        isPosValidStart = this.battlefield.isPosInside(x, y);
        isPosValidEnd = this.battlefield.isPosInside(
          x + this.selectedShip.hullBlocks.length,
          y
        );
      } else if (alignment === "vertical") {
        isPosValidStart = this.battlefield.isPosInside(x, y);
        isPosValidEnd = this.battlefield.isPosInside(
          x,
          y + this.selectedShip.hullBlocks.length
        );
      } else {
        console.log("Invalid alignment");
      }

      //Set Ship position if valid
      if (isPosValidStart && isPosValidEnd) {
        this.selectedShip.setShipLocation(x, y, alignment);
        return true;
      } else {
        return false;
      }
    }
    receiveAttack(x, y) {
      let blockHit = undefined;
      this.fleet.forEach(ship => {
        blockHit = ship.hullBlocks.find(
          block => block.x === x && block.y === y
        );
        if (blockHit === undefined) {
          console.log("miss");
          //mark miss
        } else {
          console.log("hit");
          blockHit.isHit++;
          ship.health--;
          //mark hit
        }
      });
    }
  }
  let _fleetcommand = new Fleet();
  _fleetcommand.selectShip("Curser");
  console.log(_fleetcommand.positionShip(4, 3, "horizontal"));
  console.log(_fleetcommand.selectedShip);

  _fleetcommand.receiveAttack(7, 3);
})();

console.log("///////////////////////////////////////////");
const ships = ShipFactory.getShips();
console.log(ships);
const battlefield = GameBoardFactory.newGameBoard();
console.log(battlefield);
console.log("///////////////////////////////////////////");
