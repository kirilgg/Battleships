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
    _ships.push(new Ship("Curser", 5));
    _ships.push(new Ship("Destroyer1", 4));
    _ships.push(new Ship("Destroyer2", 4));
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
  function clearCanvas() {
    canvas.innerHTML = "";
  }
  function createBattleGrid(battlefield, playerName) {
    const grid = document.createElement("table");
    grid.setAttribute("class", "grid");
    grid.setAttribute("name", playerName);
    let row = {};
    let col = {};
    let div = {};
    for (let y = 0; y < battlefield.sizeY; y++) {
      row = document.createElement("tr");
      row.setAttribute("class", "grid-row");
      for (let x = 0; x < battlefield.sizeX; x++) {
        div = document.createElement("div");
        div.innerHTML = ".";
        div.setAttribute("class", "grid-location");
        div.setAttribute("name", `${x}-${y}`);
        col = document.createElement("td");
        col.setAttribute("class", "grid-col");
        col.append(div);
        row.append(col);
      }
      grid.append(row);
    }
    return grid;
  }
  function createVerticalInfo(sizeY) {
    let col = document.createElement("div");
    col.setAttribute("class", "grid-info-vertical");
    let info = {};
    for (let y = 0; y < sizeY; y++) {
      info = document.createElement("div");
      info.innerHTML = `${String.fromCharCode(65 + y)}`;
      info.setAttribute("class", "grid-info");
      col.append(info);
    }
    return col;
  }
  function createHorizontalInfo(sizeX) {
    let col = document.createElement("div");
    col.setAttribute("class", "grid-info-horizontal");
    let info = {};
    for (let x = 1; x < sizeX + 1; x++) {
      info = document.createElement("div");
      info.innerHTML = `${x}`;
      info.setAttribute("class", "grid-info");
      col.append(info);
    }
    return col;
  }

  function createBattlefield(battlefield, playerName) {
    const ui = document.createElement("div");
    ui.setAttribute("class", "player");
    const tableFix = document.createElement("div");
    tableFix.setAttribute("class", "table-fix");

    ui.appendChild(createHorizontalInfo(battlefield.sizeX));
    ui.appendChild(createVerticalInfo(battlefield.sizeY));
    tableFix.appendChild(createBattleGrid(battlefield, playerName));
    ui.appendChild(tableFix);
    canvas.appendChild(ui);
  }
  function showFleet(fleet, playerName) {
    const grid = canvas.querySelector(`[name="${playerName}"]`);
    let td = {};
    let tdClass = {};
    fleet.forEach(ship => {
      ship.hullBlocks.forEach(block => {
        td = grid.querySelector(`[name="${block.x}-${block.y}"]`);
        tdClass = td.getAttribute("class");
        tdClass += " grid-ship";
        td.setAttribute("class", tdClass);
      });
    });
  }
  function updateBattlefield(battlefield, playerName) {
    const grid = canvas.querySelector(`[name="${playerName}"]`);
    let tr = {};
    let td = {};
    let tdClass = "";
    for (let y = 0; y < battlefield.sizeY; y++) {
      tr = grid.children[y];
      for (let x = 0; x < battlefield.sizeX; x++) {
        td = tr.children[x];
        td.firstChild.innerHTML = battlefield.board[x][y];
        if (
          battlefield.board[x][y] === "-" &&
          !td.firstChild.classList.contains("miss")
        ) {
          tdClass = td.firstChild.getAttribute("class");
          tdClass += " miss";
          td.firstChild.setAttribute("class", tdClass);
        }
        if (
          battlefield.board[x][y] === "x" &&
          !td.firstChild.classList.contains("hit")
        ) {
          tdClass = td.firstChild.getAttribute("class");
          tdClass += " hit";
          td.firstChild.setAttribute("class", tdClass);
        }
      }
    }
  }
  function renderDestroyedShip(ship, playerName) {
    const grid = canvas.querySelector(`[name="${playerName}"]`);
    let glClasses = "";
    let gridLocation = {};
    ship.hullBlocks.forEach(block => {
      gridLocation = grid.children[block.y].children[block.x].firstChild;
      glClasses = gridLocation.getAttribute("class");
      if (!gridLocation.classList.contains("destroyed")) {
        glClasses += " destroyed";
        gridLocation.setAttribute("class", glClasses);
      }
    });
  }
  function renderGameEnd(playerName, turns) {
    const display = document.createElement("div");
    const head = document.createElement("h2");
    const msg = document.createElement("p");
    const btn = document.createElement("button");
    display.setAttribute("class", "game-end");
    head.setAttribute("class", "game-end__winner");
    msg.setAttribute("class", "game-end__msg");
    btn.setAttribute("class", "game-end__button");
    head.innerHTML = `${playerName} Won!`;
    msg.innerHTML = `${playerName} have played ${turns} turns`;
    btn.innerHTML = "Start new game";
    display.append(head);
    display.append(msg);
    display.append(btn);
    canvas.append(display);
  }
  function createPlayerInput() {
    const display = document.createElement("div");
    const btn = document.createElement("button");
    const input = document.createElement("input");
    display.setAttribute("class", "player-input");
    btn.setAttribute("class", "player-input__btn");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Fire at position:");
    input.setAttribute("class", "player-input__field");
    btn.innerHTML = "Fire";
    display.append(btn);
    display.append(input);
    canvas.append(display);
  }
  return {
    showFleet: showFleet,
    createBattlefield: createBattlefield,
    updateBattlefield: updateBattlefield,
    renderDestroyedShip: renderDestroyedShip,
    renderGameEnd: renderGameEnd,
    clearCanvas: clearCanvas,
    createPlayerInput: createPlayerInput
  };
})();

const PlayerCtrl = (function() {
  class Player {
    constructor(name) {
      this.name = name;
      this.roundsPlayed = 0;
      this.command = FleetModel.newFleet();
      this.attackPosX = 0;
      this.attackPosY = 0;
      this.history = [];
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
    isAttackUniq() {
      let isUniq = true;
      this.history.forEach(entry => {
        if (this.attackPosX === entry.posX && this.attackPosY === entry.posY) {
          isUniq = false;
        }
      });
      return isUniq;
    }
    play(attack) {
      this.roundsPlayed++;
      this.attackWasHit = attack(this.attackPosX, this.attackPosY);
      this.lastAttack = {
        posX: this.attackPosX,
        posY: this.attackPosY,
        hit: this.attackWasHit
      };
      this.history.push(this.lastAttack);
      return this.attackWasHit;
    }
    setAttackPosition(x, y) {
      this.attackPosX = x;
      this.attackPosY = y;
    }
  }
  class AI extends Player {
    constructor(name) {
      super(name);
      this.attackWasHit = false;
      this.hits = [];
      this.attacks = [];
      this.inSequence = false;
      this.maxShipSize = 0;
      this.setMaxShipSize();
    }
    setMaxShipSize() {
      this.command.fleet.forEach(ship => {
        if (ship.hullBlocks.length >= this.maxShipSize) {
          this.maxShipSize = ship.hullBlocks.length;
        }
      });
    }
    checkAndSetLocation(x, y) {
      this.attackPosX = x;
      this.attackPosY = y;
      if (this.isAttackUniq()) {
        // check if Uniq for the attacks stack
        let isUniq = true;
        this.attacks.forEach(entry => {
          if (x === entry.x && y === entry.y) {
            isUniq = false;
          }
        });
        if (isUniq) {
          this.attacks.push({ x: x, y: y });
          return true;
        }
      } else {
        return false;
      }
    }
    tryUp(x, y) {
      if (y - 1 >= 0) {
        return this.checkAndSetLocation(x, y - 1);
      }
    }
    tryDown(x, y) {
      if (y + 1 < this.command.battlefield.sizeY) {
        return this.checkAndSetLocation(x, y + 1);
      }
    }
    tryLeft(x, y) {
      if (x - 1 >= 0) {
        return this.checkAndSetLocation(x - 1, y);
      }
    }
    tryRight(x, y) {
      if (x + 1 < this.command.battlefield.sizeX) {
        return this.checkAndSetLocation(x + 1, y);
      }
    }
    generateSmartAttacks() {
      let x = this.hits[this.hits.length - 1].posX;
      let y = this.hits[this.hits.length - 1].posY;
      if (this.hits.length === 1) {
        this.tryUp(x, y);
        this.tryDown(x, y);
        this.tryLeft(x, y);
        this.tryRight(x, y);
      } else {
        this.attacks.forEach(() => this.attacks.pop());
        this.attacks.pop();
        //Try most left & most right / most up & most down
        for (let i = 0; i < this.hits.length; i++) {
          for (let k = i + 1; k < this.hits.length; k++) {
            if (this.hits[i].posX === this.hits[k].posX) {
              this.tryUp(this.hits[i].posX, this.hits[i].posY);
              this.tryDown(this.hits[i].posX, this.hits[i].posY);
              this.tryUp(this.hits[k].posX, this.hits[k].posY);
              this.tryDown(this.hits[k].posX, this.hits[k].posY);
            }
            if (this.hits[i].posY === this.hits[k].posY) {
              this.tryLeft(this.hits[i].posX, this.hits[i].posY);
              this.tryRight(this.hits[i].posX, this.hits[i].posY);
              this.tryLeft(this.hits[k].posX, this.hits[k].posY);
              this.tryRight(this.hits[k].posX, this.hits[k].posY);
            }
          }
        }
      }
      if (this.attacks.length === 0) {
        this.generateRandomAttack();
        this.hits.forEach(() => this.hits.pop());
        this.hits.pop();
      }
    }
    generateRandomAttack() {
      do {
        this.attackPosX = this.getRandomPosX();
        this.attackPosY = this.getRandomPosY();
      } while (!this.isAttackUniq());
      let x = this.attackPosX;
      let y = this.attackPosY;
      this.attacks.push({ x, y });
    }
    play(attack) {
      if (this.attackWasHit) {
        this.hits.push(this.history[this.history.length - 1]);
      }
      if (this.hits.length === 0) {
        this.generateRandomAttack();
      } else {
        if (this.attacks.length === 0 || this.attackWasHit) {
          this.generateSmartAttacks();
        }
      }
      try {
        let positions = this.attacks.pop();
        this.attackPosX = positions.x;
        this.attackPosY = positions.y;
      } catch (error) {
        console.log(error);
        this.generateRandomAttack();
      }

      return super.play(attack);
    }
  }
  return {
    newPlayerHuman(name) {
      return new Player(name);
    },
    newPlayerAI(name) {
      return new AI(name);
    }
  };
})();

(function GameController(FleetModel, UI, PlayerCtrl) {
  let playerHuman = {};
  let playerPC = {};
  let scored = false;
  let gameIsRunning = true;
  let shipsLeft = 0;
  let locationName = "";
  let location = {};
  let x = 0;
  let y = 0;
  let regex = RegExp("^[A-J]([1-9]|10)$");
  let textInput = "";
  newGame();
  const canvas = document.querySelector(".canvas");
  canvas.addEventListener("click", event => {
    if (event.target.classList.contains("grid-location") && gameIsRunning) {
      location = event.target.parentElement.parentElement.parentElement;
      locationName = location.getAttribute("name");
      if (locationName == "PC") {
        try {
          locationName = event.target.getAttribute("name");
          x = parseInt(locationName[0]);
          y = parseInt(locationName[2]);
          playRound(x, y);
        } catch (error) {
          console.log(error);
          console.log("Please don't break my game!");
          //restart game ?!
        }
      }
    } else if (event.target.classList.contains("game-end__button")) {
      newGame();
      gameIsRunning = true;
    } else if (event.target.classList.contains("player-input__btn")) {
      textInput = event.target.nextSibling.value;
      if (event.target.nextSibling.value === "show") {
        UI.showFleet(playerPC.command.fleet, playerPC.name);
      } else {
        if (regex.test(textInput)) {
          y = textInput.charCodeAt(0) - 65;
          x = textInput.replace(/[A-J]/, "0");
          playRound(Number(x) - 1, y);
        }
      }
    }
  });
  function newGame() {
    playerHuman = PlayerCtrl.newPlayerHuman("You");
    playerPC = PlayerCtrl.newPlayerAI("PC");
    playerHuman.generateRandomShipPosition();
    playerPC.generateRandomShipPosition();
    UI.clearCanvas();
    UI.createPlayerInput();
    UI.createBattlefield(playerHuman.command.battlefield, playerHuman.name);
    UI.createBattlefield(playerPC.command.battlefield, playerPC.name);
    UI.showFleet(playerHuman.command.fleet, playerHuman.name);
  }
  function checkIfShipIsDestroyed(player) {
    shipsLeft = player.command.fleet.length;
    player.command.fleet.forEach(ship => {
      if (ship.health === 0) {
        shipsLeft--;
        UI.renderDestroyedShip(ship, player.name);
      }
    });
  }
  function isEndGame(player) {
    if (shipsLeft === 0) {
      UI.renderGameEnd(player.name, player.roundsPlayed);
      gameIsRunning = false;
      return true;
    }
    return false;
  }
  function playRound(x, y) {
    //Human turn
    playerHuman.setAttackPosition(x, y);
    if (!playerHuman.isAttackUniq()) return;
    scored = playerHuman.play((x, y) => playerPC.command.receiveAttack(x, y));
    UI.updateBattlefield(playerPC.command.battlefield, playerPC.name);
    checkIfShipIsDestroyed(playerPC);
    if (isEndGame(playerHuman)) return;
    if (scored) return; // skip PC to play another turn

    //PC turn
    do {
      scored = playerPC.play((x, y) => playerHuman.command.receiveAttack(x, y));
      UI.updateBattlefield(playerHuman.command.battlefield, playerHuman.name);
      checkIfShipIsDestroyed(playerHuman);
      if (isEndGame(playerPC)) return;
    } while (scored);
  }
})(FleetModel, UI, PlayerCtrl);
