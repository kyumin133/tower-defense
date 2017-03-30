import Tower from "./tower";
import Monster from "./monster";

const SVGNS = "http://www.w3.org/2000/svg";
const PATH_D = "M 180 0 L 180 140 L 100 140 L 100 420 L 300 420 L 300 100 L 620 100 L 620 220 L 420 220 L 420 340 L 801 340";
const TOWERS = {
  arrow: {
    name: "Arrow",
    price: 60,
    index: 1,
    description: "Low damage but high range and rate of fire.",
    range: 120,
  },
  ice: {
    name: "Ice",
    price: 80,
    index: 2,
    description: "Medium damage, range, and rate of fire. Slows enemies.",
    range: 100,
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

    this.offset = this.$field.offset();
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
    this.updateGold(240)
    this.updateLives(20);
    this.updateLevel(0);
    this.monsterQueue = [];
    this.towerQueue = [];
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
    selection.setAttribute("visibility", "hidden");
    selection.setAttribute("class", "button selection");

    let range = document.createElementNS(SVGNS, "circle");
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

    for(let i = 0; i < count; i++) {
      new Monster(this.level, i, this);
    }

    this.liveMonster += count;
    if (!this.playing) {
      this.playing = true;
      this.requestID = window.requestAnimationFrame(this.draw);
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
    this.buy(e.target);
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
    }
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
  }

  getGridCoordinates(e) {
    let coords = [];
    let increment = this.grid.increment;
    let width = this.grid.width;
    let height = this.grid.height;

    let x = Math.floor((e.clientX - this.offset.top) / increment);
    let y = Math.floor((e.clientY - this.offset.top) / increment);

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
      let tower = new Tower(this, this.buildingType, [x, y]);
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
      } else {
        $(`#buy_${towerKey}`).attr("opacity", "1");
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
        $("#upgrade").attr("opacity", "1");
      }
    }
  }

  draw() {
    this.requestID = window.requestAnimationFrame(this.draw);

    window.setTimeout(() => {
      // let bullet;
      // for (let i = 0; i < bulletQueue.length; i++) {
      //   bullet = bulletQueue.shift();
      //   bullet.updatePath();
      // }

      // let len = this.monsterQueue.length;
      // let path = document.getElementById("path");
      // let p;

      let monsterQueue = this.monsterQueue;
      for (let i = 0; i < monsterQueue.length; i++) {
        let monster = monsterQueue.shift();
        if ((!monster.alive) || (monster.svg.getAttribute("class") == "hidden-monster")) {
          if (monster.framesToSpawn > 1) {
            monster.framesToSpawn--;
            monsterQueue.push(monster);
            continue;
          } else if (monster.framesToSpawn == 1) {
            monster.alive = true;
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
        monster.svg.setAttribute("cx", p.x);
        monster.svg.setAttribute("cy", p.y);
        if (this.getDistance(p.x, p.y, this.pathEnd.x, this.pathEnd.y) <= monster.svg.getAttribute("r")) {      //reached the end
          monster.svg.setAttribute("visibility", "hidden");
          if (!!this.selectedMonster) { //clear selection if selected
            if (monster.selected) {
              this.clearSelection();
            }
          }

          this.updateLives(this.lives - 1);

          if (this.lives === 0) {
            window.cancelAnimationFrame(this.requestID);
            // this.gold = 0;
            // updateBuyable();
            // let game_over_group = document.getElementById("game_over_group");
            // let temp = game_over_group.parentNode;
            // temp.removeChild(game_over_group);
            // temp.appendChild(game_over_group);
            // $(game_over_group).attr("visibility", "visible");
            // document.getElementById("game_over_anim").beginElement();
            // playing = false;
            // clearSelection();
            // building = false;
            // game_over = true;
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

        // console.log((this.frame - tower.startFrame) % tower.interval[tower.level]);
        // debugger;
        if ((this.frame - tower.startFrame) % tower.interval[tower.level] === 0) {
          // console.log(this.frame);
          tower.shoot();
        }
      }

      // $("#gold").text(gold);
      // $("#lives").text(lives);
      this.frame++;

      if (monsterQueue.length <= 0) {
        window.cancelAnimationFrame(this.requestID);
      }
    }, this.frameLength);
  }

  getDistance(x1, y1, x2, y2) {
    let dx = (x1 - x2);
    let dy = (y1 - y2);
    return ((dx ** 2) + (dy ** 2)) ** 0.5;
  }
}

export default Game;
