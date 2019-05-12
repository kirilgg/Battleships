"use strict";

const ShipFactory = (function() {
  //privet
  let _ships = [];
  class Ship {
    constructor(name, size) {
      this.name = name;
      this.health = size;
      this.alignment = "";
      this.hullBlocks = new Array(size).fill({
        isHit: 0,
        x: 0,
        y: 0
      });
    }

    setShipLocation(x, y, alignment) {
      this.alignment = alignment;
      if (alignment === "vertical") {
        this.hullBlocks.forEach((block, i) => {
          block.x = x + i;
          block.y = y;
        });
      } else {
        this.hullBlocks.forEach((block, i) => {
          block.x = x;
          block.y = y + i;
        });
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
      this.board = new Array(sizeX).fill(new Array(sizeY).fill("."));
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
      //Validate ship position on game bord
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
  }
  let _fleetcommand = new Fleet();
  _fleetcommand.selectShip("Curser");
  console.log(_fleetcommand.selectedShip);
  console.log(_fleetcommand.positionShip(0, 3, "horizontal"));
})();

console.log("///////////////////////////////////////////");
const ships = ShipFactory.getShips();
console.log(ships);
const battlefield = GameBoardFactory.newGameBoard();
console.log(battlefield);
console.log("///////////////////////////////////////////");
