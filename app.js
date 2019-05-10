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
