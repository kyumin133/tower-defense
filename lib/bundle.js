/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__tower__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__monster__ = __webpack_require__(3);



const SVGNS = "http://www.w3.org/2000/svg";
const PATH_D = "M 180 0 L 180 140 L 100 140 L 100 420 L 300 420 L 300 100 L 620 100 L 620 220 L 420 220 L 420 340 L 801 340";
const TOWERS = {
  arrow: {
    name: "Arrow",
    price: 60,
    index: 1,
    description: "Low damage but high range and rate of fire.",
    range: 140,
  },
  ice: {
    name: "Ice",
    price: 80,
    index: 2,
    description: "Medium damage, range, and rate of fire. Slows enemies.",
    range: 120,
  },
  cannon: {
    name: "Cannon",
    price: 100,
    index: 3,
    description: "High damage but low range and rate of fire. Applies splash damage to nearby enemies.",
    range: 100
  },
  assassin: {
    name: "Assassin",
    price: 150,
    index: 4,
    description: "High range but low rate of fire. Deals more damage to low-health targets.",
    range: 120
  },
};

class Game {
  constructor() {
    this.$field = $("#field");

    this.grid = {
      increment: 40,
      height: 13,
      width: 20
    }

    this.fps = 60;
    this.frameLength = 1000 / this.fps

    this.initializeAnimation();
    this.buildPath();
    this.buildIndicators();
    this.loadTooltips();
    this.addListeners();
    this.newGame();

    this.draw = this.draw.bind(this);
  }

  newGame() {
    $("#game_over_group").attr("visibility", "hidden");
    this.gameOver = false;
    this.updateGold(240)
    this.updateLives(20);
    this.updateLevel(0);
    this.updateBuyable();

    this.monsterQueue = this.monsterQueue || [];
    for (let i = 0; i < this.monsterQueue.length; i++) {
      let monster = this.monsterQueue.shift();
      monster.svg.parentNode.removeChild(monster.svg);
    }

    this.towerQueue = this.towerQueue || [];
    for (let i = 0; i < this.towerQueue.length; i++) {
      let tower = this.towerQueue.shift();
      tower.svg.parentNode.removeChild(tower.svg);
    }

    this.bulletQueue = this.bulletQueue || [];
    for (let i = 0; i < this.bulletQueue.length; i++) {
      let bullet = this.bulletQueue.shift();
      bullet.svg.parentNode.removeChild(bullet.svg);
    }

    this.frame = 0;
  }

  updateGold(gold) {
    this.gold = gold;
    $("#gold").text(gold);
  }

  updateLives(lives) {
    this.lives = lives;
    $("#lives").text(lives);
  }

  updateLevel(level) {
    this.level = level;
    $("#level").text(`Level: ${level}`);
  }

  initializeAnimation() {
    let lastTime = 0;
    let vendors = ['ms', 'moz', 'webkit', 'o'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback, element) => {
          let currTime = new Date().getTime();
          let timeToCall = Math.max(0, 16 - (currTime - lastTime));
          let id = window.setTimeout(() => { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => {
          clearTimeout(id);
      };
    }
  }

  buildPath() {
    let pathBackground = document.createElementNS(SVGNS, "path");
    pathBackground.setAttribute("d", PATH_D);
    pathBackground.setAttribute("id", "path_background");
    pathBackground.setAttribute("class", "path-background");

    let path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", PATH_D);
    path.setAttribute("id", "path");
    path.setAttribute("class", "path");

    $("#game").append(pathBackground);
    $("#game").append(path);

    let pathStart = document.getElementById("game").createSVGPoint();
    pathStart.x = 180;
    pathStart.y = 0;
    this.pathStart = pathStart;

    let pathEnd = document.getElementById("game").createSVGPoint();
    pathEnd.x = 800;
    pathEnd.y = 340;
    this.pathEnd = pathEnd;

    this.path = path;
    this.pathLength = path.getTotalLength();
  }

  buildIndicators() {
    let selection = document.createElementNS(SVGNS, "rect");
    selection.setAttribute("x", 0);
    selection.setAttribute("y", 0);
    selection.setAttribute("rx", 5);
    selection.setAttribute("ry", 5);
    selection.setAttribute("visibility", "hidden");
    selection.setAttribute("class", "button selection");

    let range = document.createElementNS(SVGNS, "circle");
    range.setAttribute("id", "range");
    range.setAttribute("class", "range");

    $("#game").append(selection);
    $("#game").append(range);

    this.$selection = $(selection);
    this.$range = $(range);
  }

  addListeners() {
    this.addFieldListeners();
    this.addBuyListeners();
    this.addDetailsListeners();
    this.addKeyListeners();
  }

  addFieldListeners() {
    let field = this.$field;
    field.on("mousemove", (e) => {
      this.mouseOverField(e);
    });

    field.on("click", (e) => {

    });

    let selection = this.$selection;
    selection.on("click", (e) => {
      this.clickField(e);
    });

    selection.on("mouseleave", (e) => {
      selection.attr("visibility", "hidden");
      this.$range.attr("visibility", "hidden");
    });
  }

  addBuyListeners() {
    $(".buy").on("click", (e) => {
      this.clickBuy(e);
    });

    $(".buy").on("mouseover", (e) => {
      this.mouseOverBuy(e);
    });

    $(".buy").on("mouseleave", (e) => {
      this.hideTooltip(e);
    });
  }

  addDetailsListeners() {
    $("#upgrade_button").on("mouseover", (e) => {
      this.mouseOverUpgrade(e);
    });

    $("#upgrade_button").on("mouseleave", (e) => {
      this.hideTooltip(e);
    });


    $("#upgrade_button").on("click", (e) => {
      if (!!this.selectedTower) {
        this.selectedTower.upgrade();
      }
    });

    $("#sell_button").on("mouseover", (e) => {
      this.mouseOverSell(e);
    });

    $("#sell_button").on("mouseleave", (e) => {
      this.hideTooltip(e);
    });


    $("#sell_button").on("click", (e) => {
      if (!!this.selectedTower) {
        this.selectedTower.sell();
      }
    });

    $(".priority").on("click", (e) => {
      if (!this.selectedTower) {
        return;
      }
      let newPriority = $(e.target).attr("id").replace(/priority_(\w+)_button/, "$1");
      let oldPriority = this.selectedTower.priority;
      if (newPriority === oldPriority) {
        return;
      }

      this.selectedTower.setPriority(newPriority);
    })
  }

  addKeyListeners() {
    $(window).on("keydown", (e) => {
      if (e.keyCode === 27) { //ESC
        if (this.building) {
          $("#selection").attr("visibility", "hidden");
          $("#range").attr("visibility", "hidden");
          this.clearSelection();
          this.building = false;
        } else {
          this.clearSelection();
        }
        return;
      }
      if (e.keyCode === 32) {    //space
        if (!this.gameOver) {
          if (!this.drawing) {
            this.requestID = window.requestAnimationFrame(this.draw);
          }
          this.spawnWave();
        }
        return;
      }

      // if ((e.shiftKey) && (e.keyCode == 85)) { //shift-U
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_closest_button"));
      //   }
      //   return;
      // }
      // if ((e.shiftKey) && (e.keyCode == 73)) { //shift-I
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_first_button"));
      //   }
      //   return;
      // }
      // if ((e.shiftKey) && (e.keyCode == 79)) { //shift-O
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_strongest_button"));
      //   }
      //   return;
      // }
      // if ((e.shiftKey) && (e.keyCode == 74)) { //shift-J
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_farthest_button"));
      //   }
      //   return;
      // }
      // if ((e.shiftKey) && (e.keyCode == 75)) { //shift-K
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_last_button"));
      //   }
      //   return;
      // }
      // if ((e.shiftKey) && (e.keyCode == 76)) { //shift-L
      //   if (selectedTower != null) {
      //     clickPriority(null, $("#priority_weakest_button"));
      //   }
      //   return;
      // }

      if (e.keyCode === 49) { //1
        this.buy($("#buy_arrow"));
        return;
      }
      if (e.keyCode === 50) { //2
        this.buy($("#buy_ice"));
        return;
      }
      if (e.keyCode === 51) { //3
        this.buy($("#buy_cannon"));
        return;
      }
      if (e.keyCode === 52) { //4
        this.buy($("#buy_assassin"));
        return;
      }
      if (e.keyCode === 80) { //(P)ause
        if (this.playing) {
          this.playing = false;
          window.cancelAnimationFrame(this.requestID);
          this.drawing = false;
          return;
        } else {
          this.playing = true;
          this.requestID = window.requestAnimationFrame(this.draw);
          return;
        }
      }
      if (e.keyCode === 83) { //(S)ell
        if (!!this.selectedTower) {
          this.selectedTower.sell();
          return;
        }
      }
      if (e.keyCode === 85) { //(U)pgrade
        if (!!this.selectedTower) {
          this.selectedTower.upgrade();
          return;
        }
      }
    });
  }


  spawnWave(count = 10) {
    this.updateLevel(this.level + 1);

    let randomRgbArr = [0, 0, 0];
    for (let i = 0; i < randomRgbArr.length; i++) {
      randomRgbArr[i] = Math.round(100 * Math.random());
    }

    let randomRgb = `rgb(${randomRgbArr.join(", ")})`;
    // console.log(randomRgb);

    for(let i = 0; i < count; i++) {
      new __WEBPACK_IMPORTED_MODULE_1__monster__["a" /* default */](this.level, i, this, randomRgb);
    }

    this.liveMonster += count;
    if (!this.playing) {
      this.playing = true;
      // this.requestID = window.requestAnimationFrame(this.draw);
    }
  }

  loadTooltips() {
    this.loadBuy();
  }

  loadBuy() {
    let svgHeight = 24;
    let svgWidth = 24;
    let boxHeight = 50;
    let boxWidth = 240;

    let tooltipGroup = document.createElementNS(SVGNS, "g");
    let tooltipBox = document.createElementNS(SVGNS, "rect");
    $(tooltipBox).attr("class", "tooltip");

    let title = document.createElementNS(SVGNS, "tspan");
    $(title).attr("class", "title")

    let price = document.createElementNS(SVGNS, "tspan");
    $(price).attr("class", "price")

    let desc = document.createElementNS(SVGNS, "tspan");
    $(desc).attr("class", "description")

    let tooltipText = document.createElementNS(SVGNS, "text");
    $(tooltipText).attr("class", "tooltip-text");

    tooltipText.appendChild(title);
    tooltipText.appendChild(price);
    tooltipText.appendChild(desc);

    $(tooltipGroup).attr("opacity", "0.9");
    $(tooltipBox).attr("height", 50);

    tooltipGroup.appendChild(tooltipBox);
    tooltipGroup.appendChild(tooltipText);

    this.tooltipBuy = {
      group: tooltipGroup,
      box: tooltipBox,
      text: tooltipText,
      title,
      price,
      desc,
      svgHeight,
      svgWidth,
      boxHeight,
      boxWidth
    }
  }

  clickBuy(e) {
    let svg = e.target;
    let id = $(svg).attr("id");
    let type = id.slice(id.indexOf("_") + 1, id.length);

    if (this.building) {
      if (this.buildingType === type) {
        this.clearSelection();
        return;
      }
    }
    this.buy(svg);
  }

  buy(svg) {
    this.clearSelection();
    let id = $(svg).attr("id");
    let type = id.slice(id.indexOf("_") + 1, id.length);

    if (TOWERS[type].price > this.gold) {
      return;
    }

    $(svg).attr("class", `button buy selected ${type}`);
    this.building = true;
    this.buildingType = type;
  }

  clearSelection(keepCursorOn) {
    if (!!this.selectedTower) {
      this.selectedTower.unselect();
    }
    if (!!this.selectedMonster) {
      this.selectedMonster.unselect();
    }

    if ((this.building) && (keepCursorOn == undefined)) {
      this.building = false;
      $(`#buy_${this.buildingType}`).attr("class", `button buy ${this.buildingType}`);
      $("#selection").attr("visibility", "hidden");
    }

    $("#range").attr("visibility", "hidden");
  }


  mouseOverBuy(e) {
    let svg = e.target;
    let details = this.getDetails(svg);

    this.showTooltip(svg, details);
  }

  mouseOverUpgrade(e) {
    let svg = e.target;
    let details = ["Upgrade (u)", "80g", "Upgrade tower to the next level. Maximum level is 5."]
    this.showTooltip(svg, details);
  }

  mouseOverSell(e) {
    let svg = e.target;
    let details = ["Sell (s)", `${this.selectedTower.salePrice} g`, "Sell tower. 60% of cost is refunded."]
    this.showTooltip(svg, details);
  }

  getDetails(svg) {
    let details = []; // title, price, description
    let svgClass = $(svg).attr("class");
    if (svgClass == undefined) {
      if ($(svg).attr("xlink:href") != undefined) {
        svgClass = $($(svg).attr("xlink:href")).attr("class");
      }
      if (svgClass == undefined) {
        return;
      }
    }

    let id = $(svg).attr("id");

    let type = "arrow";
    for (let i = 0; i < Object.keys(TOWERS).length; i++) {
      let key = Object.keys(TOWERS)[i];
      if (svgClass.indexOf(key) !== -1) {
        type = key;
      }
    }

    // console.log(type);
    let tower = TOWERS[type]
    details[0] = `${tower.name} Tower (${tower.index})`;
    details[1] = `${tower.price} g`;
    details[2] = tower.description;
    return details;
  }

  showTooltip(svg, details) {
    let svgHeight = this.tooltipBuy.svgHeight;
    let svgWidth = this.tooltipBuy.svgWidth;
    let boxHeight = this.tooltipBuy.boxHeight;
    let boxWidth = this.tooltipBuy.boxWidth;

    let x = parseInt($(svg).attr("x")) + 0.5 * parseInt(svgWidth) - 0.5 * boxWidth;
    if (x < 0) {
      x = 0;
    } else if (x + boxWidth >= parseInt($("#game").attr("width"))) {
      x = parseInt($("#game").attr("width")) - boxWidth;
    }

    let y = parseInt($(svg).attr("y")) + parseInt(svgHeight) + 10;

    let box = this.tooltipBuy.box;
    $(box).attr("x", x);
    $(box).attr("y", y);


    let title = this.tooltipBuy.title;
    $(title).text(details[0]);
    $(title).attr("x", x + 0.5 * boxWidth);
    $(title).attr("y", y + 20);

    let price = this.tooltipBuy.price;
    $(price).text(details[1]);
    $(price).attr("x", x + boxWidth - 36);
    $(price).attr("y", y + 20);

    let group = this.tooltipBuy.group;
    $(group).attr("opacity", "0.9");

    let text = this.tooltipBuy.text;
    let desc = this.tooltipBuy.desc;

    let descs = this.processText(text, details[2], x, y, boxWidth);
    for (let i = 0; i < descs.length; i++) {
      desc.appendChild(descs[i]);
    }

    $(box).attr("height", 36 + 14 * descs.length);

    $("#game").append(group);
  }

  processText(svg, text, x, y, box_width) {
    // line wrapping, since this doesn't exist in SVG
    let descs = [];
    descs = this.processTextRecursive(descs, text, 0);

    let descSvg = [];
    for (let i = 0; i < descs.length; i++) {
      let desc = document.createElementNS(SVGNS, "tspan");
      $(desc).attr("x", x + 0.5 * box_width);
      $(desc).attr("y", y + 36 + (12 * i));
      $(desc).attr("class", "description");
      $(desc).text(descs[i]);
      descSvg.push(desc);
    }
    return descSvg;
  }

  processTextRecursive(descs, text, i) {
    if (text.length == 0) {
      return descs;
    }
    let maxLength = 40;
    if (text.length <= maxLength) {
      descs[i] = text;
      return descs;
    }

    let substr_raw = text.slice(0, maxLength);
    let lastSpace = substr_raw.lastIndexOf(" ");
    if (lastSpace == -1) {
      descs = null;
      descs = ["Error: Overflow"];
      return descs;
    }
    let substrCut = substr_raw.slice(0, lastSpace);
    let remainder = text.slice(lastSpace + 1, text.length);
    descs[i] = substrCut;

    return this.processTextRecursive(descs, remainder, i + 1);
  }

  hideTooltip(e) {
    $(this.tooltipBuy.group).remove();
    $(this.tooltipBuy.desc).empty();
  }

  mouseOverField(e) {
    if (!this.building) {
      return;
    }
    let tower = TOWERS[this.buildingType];

    let coords = this.getGridCoordinates(e);
    let increment = this.grid.increment;
    let x = coords[0];
    let y = coords[1];

    let selection = this.$selection;
    selection.attr("x", (x * increment));
    selection.attr("y", (y * increment));
    selection.attr("class", `button selection ${this.buildingType}`);
    selection.attr("visibility", "visible");

    let range = this.$range;
    range.attr("cx" , (x + 0.5) * increment);
    range.attr("cy", (y + 0.5) * increment);
    // range.attr("fill", tower.color)
    range.attr("r", tower.range);
    range.attr("visibility", "visible");

    $("#game").append(range);
  }

  getGridCoordinates(e) {
    let coords = [];
    let increment = this.grid.increment;
    let width = this.grid.width;
    let height = this.grid.height;

    let offset = $("#game").offset();
    let x = Math.floor((e.clientX - offset.left) / increment);
    let y = Math.floor((e.clientY - offset.top) / increment);

    if (x >= width) {
      x = width - 1;
    }
    if (y >= height) {
      y = height - 1;
    }

    coords[0] = x;
    coords[1] = y;
    return coords;
  }

  clickField(e) {
    if (!this.building) {
      return;
    }
    let coords = this.getGridCoordinates(e);
    let x = this.grid.increment * coords[0];
    let y = this.grid.increment * coords[1];
    // let index = window[building_type + "_index"];
    let price = TOWERS[this.buildingType].price;
    if (price <= this.gold) {
      this.gold -= price;
      this.updateBuyable();
      $("#gold").text(this.gold);
      if (this.gold < price) {
        this.building = false;
        this.clearSelection();
        $("#buy_" + this.buildingType).attr("class", `button buy ${this.buildingType}`);
      }
      let tower = new __WEBPACK_IMPORTED_MODULE_0__tower__["a" /* default */](this, this.buildingType, [x, y]);
      $("#game").append(tower.svg);
      this.towerQueue.push(tower);
      tower.handleClick();
      // this.building = false;
    }


  }

  updateBuyable() {
    for (let i = 0; i < Object.keys(TOWERS).length; i++) {
      let towerKey = Object.keys(TOWERS)[i];
      let tower = TOWERS[towerKey];
      if (tower.price > this.gold) {
        $(`#buy_${towerKey}`).attr("opacity", "0.3");
        $(`#buy_${towerKey}_tower`).attr("opacity", "0.3");
      } else {
        $(`#buy_${towerKey}`).attr("opacity", "1");
        $(`#buy_${towerKey}_tower`).attr("opacity", "1");
      }
    }

    let selectedTower = this.selectedTower;
    if (!!selectedTower) {
      if (selectedTower.level >= selectedTower.damage.length - 1) {
        $("#upgrade").attr("class", "disabled");
        return;
      }
      let upgradePrice = selectedTower.price[selectedTower.level + 1];
      if (upgradePrice > this.gold) {
        $("#upgrade").attr("class", "disabled");
      } else {
        $("#upgrade").attr("class", "");
        $("#upgrade").attr("opacity", "1");
      }
    }
  }

  draw() {
    this.requestID = window.requestAnimationFrame(this.draw);

    window.setTimeout(() => {
      this.drawing = true;
      let bulletQueue = this.bulletQueue;
      for (let i = 0; i < bulletQueue.length; i++) {
        let bullet = bulletQueue.shift();
        bullet.updatePath();
      }

      // let len = this.monsterQueue.length;
      // let path = document.getElementById("path");
      // let p;

      let monsterQueue = this.monsterQueue;
      for (let i = 0; i < monsterQueue.length; i++) {
        let monster = monsterQueue.shift();
        if ((!monster.alive) || (monster.svg.getAttribute("visibility") === "hidden")) {
          if (monster.framesToSpawn > 1) {
            monster.framesToSpawn--;
            monsterQueue.push(monster);
            continue;
          } else if (monster.framesToSpawn == 1) {
            monster.alive = true;
            monster.svg.setAttribute("visibility", "visible");
            monster.svg.setAttribute("class", "monster");
            monster.framesToSpawn--;
          } else {
            continue;
          }
        }

        let stepLength = monster.stepLength;
        if (monster.slowed) {
          stepLength *= (1 - monster.slowedAmount);
          monster.slowedTimer--;
          if (monster.slowedTimer <= 0) {
            //alert(monster.slowedTimer);
            monster.slowed = false;
            monster.slowedAmount = 0;
            monster.slowedTimer = 0;
          }
        }

        monster.step += stepLength;

        // console.log(monster.stepLength);
        let p = this.path.getPointAtLength(monster.step);
        //alert(p.x + ", " + p.y + " (" + monster.stepLength + ")");

        monster.moveTo(p.x, p.y);

        if (this.getDistance(p.x, p.y, this.pathEnd.x, this.pathEnd.y) <= monster.r) {      //reached the end
          monster.svg.setAttribute("visibility", "hidden");
          if (!!this.selectedMonster) { //clear selection if selected
            if (monster.selected) {
              this.clearSelection();
            }
          }

          this.updateLives(this.lives - 1);

          if (this.lives === 0) {
            window.cancelAnimationFrame(this.requestID);
            this.drawing = false;
            this.gold = 0;
            this.updateBuyable();
            let gameOverGroup = document.getElementById("game_over_group");
            let temp = gameOverGroup.parentNode;
            temp.removeChild(gameOverGroup);
            temp.appendChild(gameOverGroup);
            $(gameOverGroup).attr("visibility", "visible");
            $("#play_again").on("click", () => { this.newGame(); });
            document.getElementById("game_over_anim").beginElement();
            this.playing = false;
            this.clearSelection();
            this.building = false;
            this.gameOver = true;
          }
        } else {
          monsterQueue.push(monster);
        }
        if (monster.selected) {
          monster.refreshMonsterDetails();
        }
      }

      let towerQueue = this.towerQueue;
      for (let i = 0; i < towerQueue.length; i++) {
        let tower = towerQueue[i];
        if (tower.selected) {
          tower.refreshTowerDetails();
        }

        if (!!tower.target) {
          tower.updateAngle();
        }

        // console.log((this.frame - tower.startFrame) % tower.interval[tower.level]);
        // debugger;
        if ((this.frame - tower.startFrame) % tower.interval[tower.level] === 0) {
          // console.log(this.frame);
          tower.shoot();
        }

        if (tower.shooting) {
          tower.updateShooting();
        }
      }

      // $("#gold").text(gold);
      // $("#lives").text(lives);
      this.frame++;

      if (monsterQueue.length <= 0) {
        window.cancelAnimationFrame(this.requestID);
        for (let i = 0; i < this.bulletQueue.length; i++) {
          let bullet = this.bulletQueue[i];
          bullet.svg.parentNode.removeChild(bullet.svg);
        }
        this.bulletQueue = [];
        this.drawing = false;
      }
    }, this.frameLength);
  }

  getDistance(x1, y1, x2, y2) {
    let dx = (x1 - x2);
    let dy = (y1 - y2);
    return ((dx ** 2) + (dy ** 2)) ** 0.5;
  }
}

/* harmony default export */ __webpack_exports__["a"] = (Game);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const SVGNS = "http://www.w3.org/2000/svg";
const SPEED = {
  arrow: 7,
  ice: 6,
  cannon: 5
};

const XLINK_URL = "http://www.w3.org/1999/xlink";

class Bullet {
    constructor(tower, target, game) {
      this.game = game;
      this.tower = tower;
      this.target = target;
      this.speed = SPEED[this.tower.type];

      let bulletPoint = document.createElementNS(SVGNS,"point");

      $(bulletPoint).attr("class", `${tower.type}-bullet`);
      $(bulletPoint).attr("x", 0);
      $(bulletPoint).attr("y", 0);

      let bulletProjectile = document.createElementNS(SVGNS, "use");
      bulletProjectile.setAttributeNS(XLINK_URL, "xlink:href", `#${tower.type}_bullet`);

      let bullet = document.createElementNS(SVGNS, "g");
      $(bullet).append(bulletPoint);
      $(bullet).append(bulletProjectile);

      this.cx = tower.cx;
      this.cy = tower.cy;
      $(bullet).attr("transform", `translate(${this.cx}, ${this.cy})`);

      $("#game").append(bullet);

      this.svg = bullet;
      this.updatePath();
    }

    updatePath() {
      let tower = this.tower;
      let target = this.target;

      let ctm = this.svg.getCTM();
      let oldX = ctm.e;
      let oldY = ctm.f;


      let dx = target.x - oldX;
      let dy = target.y - oldY;

      let r = this.game.getDistance(target.x, target.y, oldX, oldY);

      let theta = Math.PI / 2 + Math.atan2(dy, dx);

      if (!target.alive) {
        let temp = this.svg.parentNode;
        temp.removeChild(this.svg);
        // $(this.svg).remove();
        return;
      }
      if (r <= target.r) {
        this.onHit(false);
        let temp = this.svg.parentNode;
        temp.removeChild(this.svg);
        // $(this.svg).remove();
        //window.clearInterval(loop);
      } else {
        this.game.bulletQueue.push(this);
        if (this.speed < r) { //haven't reached target yet
          let scale = this.speed / r;
          let newX = oldX + dx * scale;
          let newY = oldY + dy * scale;
          //alert($(bullet).attr("transform") + " " + oldX + " " + oldY);

          ctm.a = Math.cos(theta);
          ctm.b = Math.sin(theta);
          ctm.c = -1 * Math.sin(theta);
          ctm.d = Math.cos(theta);
          ctm.e = newX;
          ctm.f = newY;

          //$(bullet).attr("transform", "rotate(" + theta + ") translate(" + newX + ", " + newY + ")");
          $(this.svg).attr("transform", `matrix(${ctm.a}, ${ctm.b}, ${ctm.c}, ${ctm.d}, ${ctm.e}, ${ctm.f})`);
          //$(bullet).attr("transform", "translate(" + newX + "," + newY + ")");
          /*
          bullet.setAttribute("cx", parseInt(bullet.getAttribute("cx")) + parseInt((dx * scale)));
          bullet.setAttribute("cy", parseInt(bullet.getAttribute("cy")) + parseInt((dy * scale)));*/
        } else { //reached target
          this.cx = target.x;
          this.cy = target.y;

          this.svg.setAttribute("cx", this.cx);
          this.svg.setAttribute("cy", this.cy);
        }

      }
    }

    onHit(isSplash, damage = this.tower.damage[this.tower.level], target = this.target) {
      // let damage = this.tower.damage[this.tower.level];

      if (this.tower.type === "assassin") {
        let missingHp = target.maxHp - target.hp;
        let percentDamage = Math.round(missingHp * this.tower.percentMissing[this.tower.level] * 0.01);
        if (percentDamage > damage) {
          damage = percentDamage;
        }
      }

      target.hp -= damage;
      target.svg.setAttribute("fill-opacity", 0.2 + (0.8 * target.hp / target.maxHp));
      target.svg.setAttribute("stroke-opacity", 0.2 + (0.8 * target.hp / target.maxHp));

      if (target.hp <= 0) {
        target.alive = false;

        let temp = target.svg.parentNode;
        temp.removeChild(target.svg);
        // live_monsters--;
        this.tower.kills++;
        if (this.tower === this.game.selectedTower) {
          $("#tower_details_kills").text("Kills: " + this.tower.kills);
        }
        this.game.updateGold(this.game.gold + target.bounty);
        this.game.updateBuyable();

        let monsterQueue = this.game.monsterQueue;
        for(let i = 0; i < monsterQueue.length; i++) { //clean up monsterQueue
          let monster = monsterQueue.shift();
          if ((monster.alive) || (monster.framesToSpawn >= 1)) {
            monsterQueue.push(monster);
          }
        }

        if (target.selected) {
          this.game.clearSelection();
        }
      } else {
        if(!!this.tower.slow) {
          let slow = this.tower.slow[this.tower.level];
          target.slowed = true;
          if (target.slowedAmount <= slow[0]) {
            target.slowedAmount = slow[0];
            target.slowedTimer = slow[1];
          }
        }
      }

      if ((!isSplash) && (!!this.tower.splash)) {
        // let p = document.getElementById("mySVG").createSVGPoint();
        // p.x = target.cx;
        // p.y = target.cy;
        let radius;
        let monsterQueue = this.game.monsterQueue;
        for(let i = 0; i < monsterQueue.length; i++) {
          if (i === this) {
            continue;
          }

          let monster = monsterQueue[i];
          if (!monster.alive) {
            continue;
          }

          let r = this.game.getDistance(monster.x, monster.y, target.x, target.y);

          if (r <= this.tower.splash[this.tower.level][1]) {
            this.onHit(true, Math.round(damage * this.tower.splash[this.tower.level][0]), monster);
          }
        }
      }
    }
}

/* harmony default export */ __webpack_exports__["a"] = (Bullet);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__game__ = __webpack_require__(0);


$(document).ready(() => {
  new __WEBPACK_IMPORTED_MODULE_0__game__["a" /* default */]();
});


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const SVGNS = "http://www.w3.org/2000/svg";
const XLINK_URL = "http://www.w3.org/1999/xlink";

const BASE_HP = 130;
const HP_INCREASE_RATIO = 1.3;
const BASE_BOUNTY = 10;
const BOUNTY_INCREASE_RATIO = 1.1;

class Monster {
  constructor(level, index, game, color="#990000") {
    this.game = game;

    let svg = document.createElementNS(SVGNS, "use");
    $(svg).attr("visibility", "hidden");
    // let bulletProjectile = document.createElementNS(SVGNS, "use");
    svg.setAttributeNS(XLINK_URL, "xlink:href", `#monster`);

    this.x = game.pathStart.x;
    this.y = game.pathStart.y;
    this.r = 16;
    // svg.setAttribute("x", this.x);
    // svg.setAttribute("y", this.y);
    // svg.setAttribute("r", this.r);
    svg.setAttribute("transform", `translate(${this.x}, ${this.y})`);

    $("#game").append(svg);
    this.svg = svg;
    svg.setAttribute("fill", color);
    svg.setAttribute("stroke", color);

    this.maxHp = Math.round(BASE_HP * (HP_INCREASE_RATIO ** (level - 1)));
    this.hp = this.maxHp;

    this.timeToFinish = 30000; //ms from beginning to end

    if (index === 0) {
      this.alive = true;
      svg.setAttribute("class", "monster");
      svg.setAttribute("visibility", "visible")

    } else {
      this.alive = false;
    }

    this.framesToSpawn = Math.round(0.5 * this.game.fps * index);
    this.stepLength = this.game.pathLength * (this.game.frameLength / this.timeToFinish);
    // debugger;

    this.step = 0;

    this.slowedTimer = 0;
    this.slowed = false;
    this.slowedAmount = 0;

    this.bounty = Math.round(BASE_BOUNTY * (BOUNTY_INCREASE_RATIO ** (level - 1)));
    this.selected = false;

    this.game.monsterQueue.push(this);

    $(this.svg).on("click", (e) => {
      this.game.clearSelection();
      this.game.selectedMonster = this;
      this.selected = true;

      $(this.svg).attr("class", "selected-monster");
      let temp = this.svg.parentNode;
      temp.removeChild(this.svg);
      temp.appendChild(this.svg);
      $("#monster_details_group").attr("visibility", "visible");
      this.refreshMonsterDetails();
    });
  }

  unselect() {
    this.selected = false;
    $(this.svg).attr("class", "monster");
    $("#monster_details_group").attr("visibility", "hidden");
    this.selectedMonster = null;
  }

  refreshMonsterDetails() {
    $("#monster_details_name").text("Monster");
    $("#monster_details_hp").text(this.hp);
    let percentage = this.hp / this.maxHp;
    if (percentage > 0.75) {
      $("#monster_details_hp").attr("fill", "rgb(50, 120, 50)");
    } else if (percentage > 0.25) {
      $("#monster_details_hp").attr("fill", "rgb(240, 240, 0)");
    } else {
      $("#monster_details_hp").attr("fill", "rgb(240, 0, 0)");
    }
    $("#monster_details_max_hp").text("/ " + this.maxHp);
    $("#monster_details_bounty").text(this.bounty.toString() + "g");
    $("#monster_details_speed").text(Math.round(this.stepLength * 60));
    // $("#monster_details_group").attr("visibility", "visible");
  }

  moveTo(newX, newY) {
    // monster.x = p.x
    // monster.y = p.y
    // console.log(`${monster.x}, ${monster.y}`);
    // monster.svg.setAttribute("x", p.x);
    // monster.svg.setAttribute("y", p.y);
    let dx = newX - this.x;
    let dy = newY - this.y;
    let theta = Math.PI / 2 + Math.atan2(dy, dx);

    let ctm = this.svg.getCTM();
    ctm.a = Math.cos(theta);
    ctm.b = Math.sin(theta);
    ctm.c = -1 * Math.sin(theta);
    ctm.d = Math.cos(theta);
    ctm.e = newX;
    ctm.f = newY;

    $(this.svg).attr("transform", `matrix(${ctm.a}, ${ctm.b}, ${ctm.c}, ${ctm.d}, ${ctm.e}, ${ctm.f})`);
    this.x = newX;
    this.y = newY;
    // monster.svg.setAttribute("transform", `translate(${monster.x}, ${monster.y})`);
  }
}

/* harmony default export */ __webpack_exports__["a"] = (Monster);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bullet__ = __webpack_require__(1);


const SVGNS = "http://www.w3.org/2000/svg";
const XLINK_URL = "http://www.w3.org/1999/xlink";
const PI = 3.14159;
const LEVEL_COORDS = [[-16, -16], [16, -16], [-16, 16], [16, 16]]

class Tower {
  constructor(game, type, pos) {
    this.level = 0;
    this.game = game;
    this.pos = pos;
    this.type = type;
    this.shots = 0;
    this.kills = 0;
    this.special = "none";
    this.startFrame = this.game.frame;



    let svg = document.createElementNS(SVGNS, "g");
    let frame = document.createElementNS(SVGNS, "use");
    frame.setAttributeNS(XLINK_URL, "xlink:href", `#${this.type}_frame`);
    svg.appendChild(frame);

    let towerSvg = document.createElementNS(SVGNS, "g");
    let towerChildSvg = document.createElementNS(SVGNS, "use");
    towerChildSvg.setAttributeNS(XLINK_URL, "xlink:href", `#${this.type}_tower`);
    towerSvg.appendChild(towerChildSvg);

    let levels = [];
    for (let i = 0; i < 4; i++) {
      let level = document.createElementNS(SVGNS, "circle");
      $(level).attr({
        cx: LEVEL_COORDS[i][0],
        cy: LEVEL_COORDS[i][1],
        r: 2,
        class: "level-unlit"
      });
      levels.push(level);
      svg.appendChild(level);
    }

    this.levels = levels;

    switch (type) {
      case "arrow":
        this.name = "Arrow";
        this.damage = [20, 40, 80, 160, 320];
        this.range = [140, 160, 180, 200, 220];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [25, 23, 21, 19, 17];
        this.priority = "first";
        this.findTarget = () => (this.findFirstTarget());
        this.shootAnimation = () => (this.shootBowAnimation());

        let bowstring1 = document.createElementNS(SVGNS, "line");
        $(bowstring1).attr({
          class: "bowstring",
          x1: -2,
          y1: -12,
          x2: -2,
          y2: 0
        });

        towerSvg.appendChild(bowstring1);
        this.bowstring1 = bowstring1;

        let bowstring2 = document.createElementNS(SVGNS, "line");
        $(bowstring2).attr({
          class: "bowstring",
          x1: -2,
          y1: 0,
          x2: -2,
          y2: 12
        });
        towerSvg.appendChild(bowstring2);
        this.bowstring2 = bowstring2;
        break;
      case "ice":
        this.name = "Ice";
        this.damage = [40, 80, 160, 320, 640];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 37, 34, 31, 28];
        this.slow = [[0.5, 100], [0.59, 120], [0.68, 140], [0.77, 160], [0.86, 200]]; // amount, duration
        this.special = "slow";
        this.priority = "strongest";
        this.findTarget = () => (this.findStrongestTarget());
        this.shootAnimation = () => (this.shootIceAnimation());

        let iceRod = document.createElementNS(SVGNS, "line");
        let iceHolder = document.createElementNS(SVGNS, "path");
        let iceGem = document.createElementNS(SVGNS, "circle");

        $(iceRod).attr({
          x1: -15,
          y1: 0,
          x2: 7,
          y2: 0,
          class: "ice-rod"
        });

        $(iceHolder).attr({
          d: "M 13 -6 A 6 6 0 0 0 13 6 L 13 6",
          class: "ice-holder"
        });

        $(iceGem).attr({
          cx: 13,
          cy: 0,
          r: 4,
          fill: "rgb(165, 242, 243)",
          class: "ice-gem"
        });

        iceHolder.setAttributeNS(XLINK_URL, "xlink:href", `#ice_holder`);
        iceGem.setAttributeNS(XLINK_URL, "xlink:href", `#ice_gem`);

        towerSvg.appendChild(iceRod);
        towerSvg.appendChild(iceHolder);
        towerSvg.appendChild(iceGem);

        this.iceRod = iceRod;
        this.iceHolder = iceHolder;
        this.iceGem = iceGem;
        break;
      case "cannon":
        this.name = "Cannon";
        this.damage = [150, 250, 400, 800, 1600];
        this.range = [100, 120, 140, 160, 180];
        this.price = [100, 100, 200, 400, 800];
        this.interval = [85, 80, 75, 70, 65];
        this.splash = [[0.4, 50], [0.45, 55], [0.5, 60], [0.55, 65], [0.6, 70]]; // amount, radius
        this.special = "splash";
        this.priority = "closest";
        this.findTarget = () => (this.findClosestTarget());
        this.shootAnimation = () => (this.shootCannonAnimation());

        let cannonBody = document.createElementNS(SVGNS, "path");

        $(cannonBody).attr({
          d: "M -16 4 C -16 4, -12 12, 12 4 L 12 -4 C 12 -4, -12 -12, -16 -4 L -16 4 Z",
          fill: "black"
        });

        towerSvg.appendChild(cannonBody);
        this.cannonBody = cannonBody;

        break;
      case "assassin":
        this.name = "Assassin";
        this.damage = [10, 20, 40, 80, 160];
        this.range = [120, 140, 160, 180, 200];
        this.price = [150, 150, 300, 600, 1620];
        this.interval = [120, 115, 110, 105, 100, 95];
        this.percentMissing = [8, 11, 14, 17, 20];
        this.special = "assassin";
        this.findTarget = () => (this.findWeakestTarget());
        this.shootAnimation = () => (this.shootAssassinAnimation());
        break;
    }


    towerSvg.setAttribute("transform", "rotate(225)");
    svg.appendChild(towerSvg);

    svg.setAttribute("transform", `translate(${pos[0] + 20}, ${pos[1] + 20})`);
    let length = 40;
    this.cx = this.pos[0] + 0.5 * length;
    this.cy = this.pos[1] + 0.5 * length;

    // svg.setAttribute("id", `type_${pos[0]}_${pos[1]}}`);
    // svg.setAttribute("class", `tower ${type}`);
    $("#game").append(svg);
    this.svg = svg;
    this.towerSvg = towerSvg;

    this.setPriority(this.priority, true);

    $(this.svg).on("click", (e) => {
      this.handleClick(e);
    })
  }

  setPriority(newPriority, initial = false) {
    let priorities = ["closest", "farthest", "first", "last", "strongest", "weakest"];
    for (let i = 0; i < priorities.length; i++) {
      if (priorities[i] === newPriority) {
        $(`#priority_${priorities[i]}_button`).attr("class", "priority selected-priority");
      } else {
        $(`#priority_${priorities[i]}_button`).attr("class", "button priority");
      }
    }

    this.priority = newPriority;
    let functionName = "find" + newPriority.charAt(0).toUpperCase() + newPriority.slice(1) + "Target";
    this.findTarget = () => (this[functionName]() );
  }

  handleClick(e) {
    let game = this.game;
    game.clearSelection(true);
    game.selectedTower = this;

    let oldClass = $(this.svg).attr("class");
    // $(this.svg).attr("class", `tower ${this.type}-selected`)

    // if (!!this.selectedPriority) {
    //   //$(selectedPriority).attr("fill","rgb(70, 119, 187)");
    //   $(selectedPriority).attr("fill","rgb(120, 169, 237)");
    // }
    this.setPriority(this.priority, true);

    this.showRange();
    this.refreshTowerDetails();
    game.updateBuyable();
  }

  showRange() {
    let range = this.game.$range;
    range.attr("cx", this.cx)
    range.attr("cy", this.cy)
    range.attr("r", this.range[this.level]);;
    range.attr("visibility", "visible")

    $("#game").append(range);
  }

  refreshTowerDetails() {
    let level = this.level;

    $("#tower_details_name").text(this.name + " " + (level));
    if (this.type === "assassin") {
      $("#tower_details_damage").text("Damage: " + this.percentMissing[level] + "% (min " + this.damage[level] + ")");
    } else {
      $("#tower_details_damage").text("Damage: " + this.damage[level]);
    }
    $("#tower_details_range").text("Range: " + this.range[level]);
    let rate = (Math.round(600/this.interval[level])/10).toString() + "/sec";
    $("#tower_details_rate").text("Rate of fire: " + rate);
    $("#tower_details_shots").text("Shots: " + this.shots);
    $("#tower_details_kills").text("Kills: " + this.kills);
    $("#tower_details_special").text("Special: " + this.special);
    $("#tower_details_group").attr("visibility", "visible");
    let upgradePrice = this.price[level + 1];
    if (!upgradePrice) {
      $("#upgrade_price").text("--");
    } else {
      $("#upgrade_price").text(`${upgradePrice} g`);
    }

    this.getSalePrice();
    $("#sale_price").text(`${this.salePrice} g`);
  }

  getSalePrice() {
    let level = this.level;
    let total = 0;
    for (let i = 0; i <= level; i++) {
      total += this.price[i];
    }
    this.salePrice = Math.round(0.6 * total);
    return this.salePrice;
  }

  unselect() {
    $(this.svg).attr("class", `tower ${this.type}`);
    $("#tower_details_group").attr("visibility", "hidden");
    this.game.selectedTower = null;
  }

  upgrade() {
    if (this.level >= this.damage.length - 1) {
      return;
    }

    if (this.game.gold < this.price[this.level + 1]) {
      return;
    }

    let gold = this.game.gold - this.price[this.level + 1];
    this.game.updateGold(gold);

    this.level++;
    
    this.levels[this.level - 1].setAttribute("class", "level-lit");
    this.showRange();
    this.refreshTowerDetails();
    this.game.updateBuyable();
  }

  sell() {
    let gold = this.game.gold + this.getSalePrice();
    this.game.updateGold(gold);

    this.refreshTowerDetails();
    this.svg.remove();
    $("#tower_details_group").attr("visibility", "hidden");
    this.game.updateBuyable();

    let index;
    for (let i = 0; i < this.game.towerQueue.length; i++) {
      let tower = this.game.towerQueue[i];
      if (tower === this) {
        index = i;
        break;
      }
    }

    this.game.towerQueue.splice(index, 1);
  }

  shoot() {
    if(this.game.monsterQueue.length === 0) {
      return;
    }

    let target = this.findTarget();

    if (!!target) {
      this.target = target;
      this.updateAngle();
      let bullet = new __WEBPACK_IMPORTED_MODULE_0__bullet__["a" /* default */](this, target, this.game);
      this.shots++;
      if (this === this.game.selectedTower) {
        $("#tower_details_shots").text("Shots: " + this.shots);
      }

      this.shooting = true;
      this.shootingFrame = 0;
    } else {
      this.target = null;
      this.shootingFrame = 60;
      this.updateShooting();
      return;
    }
  }

  updateShooting() {
    this.shootingFrame++;
    if (this.shootingFrame > 30) {
      this.shooting = false;
      this.shootingFrame = 0;

      if (this.type === "arrow") {
        this.bowstring1.setAttribute("x2", -2);
        this.bowstring2.setAttribute("x1", -2);
      }
      return;
    }

    this.shootAnimation();
  }

  shootBowAnimation() {
    this.bowstring1.setAttribute("x2", -2 - 0.5 * this.shootingFrame);
    this.bowstring2.setAttribute("x1", -2 - 0.5 * this.shootingFrame);
  }

  shootIceAnimation() {
    let rodEnd = 3 + 4 * (1 - (this.shootingFrame / 30));
    if (this.shootingFrame >= 30) {
      // this.iceRod.setAttribute("x2", 7);
      // this.iceHolder.setAttribute("transform", "translate(0, 0)");
    } else {
      this.iceRod.setAttribute("x2", rodEnd);
    }
    this.iceHolder.setAttribute("transform", `translate(${rodEnd - 7}, 0)`);
    this.iceGem.setAttribute("transform", `translate(${rodEnd - 7}, 0)`);
    // this.iceRod.setAttribute("transform", `scale(${scale})`);
    // this.iceRod.setAttribute("transform", `translate(${scale})`);
  }

  shootCannonAnimation() {
    let x1 = -8 - 4 * (this.shootingFrame / 30);
    let x2 = 16 - 4 * (this.shootingFrame / 30);

    $(this.cannonBody).attr({
      d: `M -16 4 C -16 4, ${x1} 12, ${x2} 4 L ${x2} -4 C ${x2} -4, ${x1} -12, -16 -4 L -16 4 Z`,
      fill: "black"
    });
  }

  updateAngle() {
    if (!this.target) {
      return;
    }

    let dx = this.target.x - this.cx;
    let dy = this.target.y - this.cy;
    let angle = Math.atan2(dy, dx) * 180 / PI;

    this.towerSvg.setAttribute("transform", `rotate(${angle})`);
  }

  findClosestTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let closestVal = 99999;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if (!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;

      if(monster.svg.getAttribute("class") == "hidden-monster") {
        continue;
      }

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((r < closestVal) && (r - 10 <= this.range[this.level])) {
        closestVal = r;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }

  findFarthestTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let farthestVal = -1;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if (!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;

      if(monster.svg.getAttribute("class") == "hidden-monster") {
        continue;
      }

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((r > farthestVal) && (r - 10 <= this.range[this.level])) {
        farthestVal = r;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }

  findFirstTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let highestStep = -1;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if(!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r - 10 > this.range[this.level])) {
        continue;
      }
      if (monster.step > highestStep) {
        highestStep = monster.step;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }

  findLastTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let lowestStep = 99999;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if(!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;
      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r - 10 > this.range[this.level])) {
        continue;
      }
      if (monster.step < lowestStep) {
        lowestStep = monster.step;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }

  findStrongestTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let highestHp = -1;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if(!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;
      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r - 10 > this.range[this.level])) {
        continue;
      }
      if (monster.hp > highestHp) {
        highestHp = monster.hp;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }

  findWeakestTarget() {
    let index = -1;
    let p = document.getElementById("game").createSVGPoint();
    let monsterQueue = this.game.monsterQueue;

    let lowestHp = 99999;

    for(let  i = 0; i < monsterQueue.length; i++) {
      let monster = monsterQueue[i];
      if(!monster.alive) {
        continue;
      }

      p.x = monster.x;
      p.y = monster.y;
      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r - 10 > this.range[this.level])) {
        continue;
      }
      if (monster.hp < lowestHp) {
        lowestHp = monster.hp;
        index = i;
      }
    }

    if (index === -1) {
      return;
    }
    return monsterQueue[index];
  }
}

/* harmony default export */ __webpack_exports__["a"] = (Tower);


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map