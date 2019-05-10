"use strict";

function Ship(shipType, size) {
  //privet
  let _type = shipType;
  let _health = size;
  let _hull = [];

  for (let i = 0; i < size; i++) {
    _hull.push(1);
  }

  //public
  return {
    get type() {
      return _type;
    },
    get hull() {
      return _hull;
    },
    get size() {
      return _hull.length;
    },
    get health() {
      return _health;
    },
    hitAtPosition: position => {
      if (position < _hull.length && _hull[position] !== 0) {
        _hull[position] = 0;
        _health--;
      } else {
        console.log("Invalid hit");
      }
    }
  };
}

// presume game board is square
function GameBoard(size) {
  //privet
  let _size = size;
  let _board = [];
  initBoard();

  function initBoard() {
    for (let i = 0; i < _size; i++) {
      _board.push([]);
      for (let z = 0; z < _size; z++) {
        _board[i].push(".");
      }
    }
  }

  function isPosInsideBoard(x, y) {
    let isXInside = x >= 0 && x < _size;
    let isYInside = y >= 0 && y < _size;
    return isXInside && isYInside;
  }

  function isShipInsideBoard(x, y, alignment, shipSize) {
    let shipIsInside = false;
    let posIsValid = isPosInsideBoard(x, y);

    if (alignment === "horizontal") {
      shipIsInside = x + shipSize <= _size;
    } else if (alignment === "vertical") {
      shipIsInside = y + shipSize <= _size;
    } else {
      console.log("Invalid Alignment");
      let shipIsInside = false;
      let posIsValid = false;
    }

    return posIsValid && shipIsInside;
  }

  function isShipPositionFree(x, y, alignment, shipSize) {
    let positionIsFree = false;
    if (alignment === "horizontal") {
      for (let i = x; i < x + shipSize; i++) {
        if (_board[i][y] !== ".") {
          break;
        } else {
          positionIsFree = true;
        }
      }
    } else if (alignment === "vertical") {
      for (let i = y; i < y + shipSize; i++) {
        if (_board[x][i] !== ".") {
          break;
        } else {
          positionIsFree = true;
        }
      }
    } else {
      console.log("Invalid Alignment");
    }
    return positionIsFree;
  }
  function setShip(x, y, alignment, shipSize) {
    if (alignment === "horizontal") {
      for (let i = x; i < x + shipSize; i++) {
        _board[i][y] = "x";
      }
    }
    if (alignment === "vertical") {
      for (let i = y; i < y + shipSize; i++) {
        _board[x][i] = "x";
      }
    }
  }

  //public
  return {
    //attackPosition
    get board() {
      return _board;
    },
    setShipPosition: (x, y, alignment, ship) => {
      //validate position
      if (isShipInsideBoard(x, y, alignment, ship.size)) {
        if (isShipPositionFree(x, y, alignment, ship.size)) {
          //set position
          setShip(x, y, alignment, ship.size);
        } else {
          console.log("position is taken");
        }
      } else {
        console.log("Ship is outside board");
      }
    }
  };
}

const ship1 = new Ship("Cruiser", 4);
console.log(ship1);
console.log(ship1.hull);
console.log(ship1.type);
ship1.hitAtPosition(4);
ship1.hitAtPosition(3);
ship1.hitAtPosition(3);

ship1.hitAtPosition(2);
console.log(ship1.hull);
console.log(ship1.health);

const playerBoard = new GameBoard(10);
console.log(playerBoard);
playerBoard.setShipPosition(4, 4, "vertical", ship1);
playerBoard.setShipPosition(4, 5, "horizontal", ship1);

console.log(playerBoard.board);
