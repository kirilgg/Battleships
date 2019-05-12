"use strict";

const ShipFactory = (function() {
  //privet
  let _ships = [];
  class Ship {
    constructor(type, size) {
      this.type = type;
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
    isPosInsideBoard(x, y) {
      let isXInside = x >= 0 && x < this.sizeX;
      let isYInside = y >= 0 && y < this.sizeY;
      return isXInside && isYInside;
    }
  }
  return {
    newGameBoard(sizeX, sizeY) {
      return new GameBoard(10, 10);
    }
  };
})();

console.log("///////////////////////////////////////////");
const ships = ShipFactory.getShips();
console.log(ships);
const battlefield = GameBoardFactory.newGameBoard();
console.log(battlefield);
console.log("///////////////////////////////////////////");

// function Ship(shipType, size) {
//   //privet
//   let _type = shipType;
//   let _health = size;
//   let _hull = [];

//   //public
//   return {
//     get type() {
//       return _type;
//     },
//     get hull() {
//       return _hull;
//     },
//     get size() {
//       return _hull.length;
//     },
//     get health() {
//       return _health;
//     },
//     hitAtPosition: position => {
//       if (position < _hull.length && _hull[position] !== 0) {
//         _hull[position] = 0;
//         _health--;
//       } else {
//         console.log("Invalid hit");
//       }
//     }
//   };
// }

// // presume game board is square
// function GameBoard(size) {
//   //privet
//   let _size = size;
//   let _board = [];
//   initBoard();

//   function initBoard() {
//     for (let i = 0; i < _size; i++) {
//       _board.push([]);
//       for (let z = 0; z < _size; z++) {
//         _board[i].push(".");
//       }
//     }
//   }

//   function isPosInsideBoard(x, y) {
//     let isXInside = x >= 0 && x < _size;
//     let isYInside = y >= 0 && y < _size;
//     return isXInside && isYInside;
//   }

//   function isShipInsideBoard(x, y, alignment, shipSize) {
//     let shipIsInside = false;
//     let posIsValid = isPosInsideBoard(x, y);

//     if (alignment === "horizontal") {
//       shipIsInside = x + shipSize <= _size;
//     } else if (alignment === "vertical") {
//       shipIsInside = y + shipSize <= _size;
//     } else {
//       console.log("Invalid Alignment");
//       let shipIsInside = false;
//       let posIsValid = false;
//     }

//     return posIsValid && shipIsInside;
//   }

//   function isShipPositionFree(x, y, alignment, shipSize) {
//     let positionIsFree = false;
//     if (alignment === "horizontal") {
//       for (let i = x; i < x + shipSize; i++) {
//         if (_board[i][y] !== ".") {
//           break;
//         } else {
//           positionIsFree = true;
//         }
//       }
//     } else if (alignment === "vertical") {
//       for (let i = y; i < y + shipSize; i++) {
//         if (_board[x][i] !== ".") {
//           break;
//         } else {
//           positionIsFree = true;
//         }
//       }
//     } else {
//       console.log("Invalid Alignment");
//     }
//     return positionIsFree;
//   }
//   function setShip(x, y, alignment, shipSize) {
//     if (alignment === "horizontal") {
//       for (let i = x; i < x + shipSize; i++) {
//         _board[i][y] = "x";
//       }
//     }
//     if (alignment === "vertical") {
//       for (let i = y; i < y + shipSize; i++) {
//         _board[x][i] = "x";
//       }
//     }
//   }

//   //public
//   return {
//     //attackPosition
//     get board() {
//       return _board;
//     },
//     setShipPosition: (x, y, alignment, ship) => {
//       //validate position
//       if (isShipInsideBoard(x, y, alignment, ship.size)) {
//         if (isShipPositionFree(x, y, alignment, ship.size)) {
//           //set position
//           setShip(x, y, alignment, ship.size);
//         } else {
//           console.log("position is taken");
//         }
//       } else {
//         console.log("Ship is outside board");
//       }
//     }
//   };
// }
