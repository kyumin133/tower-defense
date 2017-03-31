import Bullet from "./bullet";

const SVGNS = "http://www.w3.org/2000/svg";
const XLINK_URL = "http://www.w3.org/1999/xlink";
const PI = 3.14159;

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

    switch (type) {
      case "arrow":
        this.name = "Arrow";
        this.damage = [30, 60, 120, 240, 480];
        this.range = [140, 160, 180, 200, 220];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [25, 23, 21, 19, 17];
        this.findTarget = () => (this.findFirstTarget());
        this.shootAnimation = () => (this.shootBowAnimation());
        break;
      case "ice":
        this.name = "Ice";
        this.damage = [40, 80, 160, 320, 640];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [60, 55, 50, 45, 40];
        this.slow = [[0.5, 100], [0.59, 120], [0.68, 140], [0.77, 160], [0.86, 200]]; // amount, duration
        this.special = "slow";
        this.findTarget = () => (this.findStrongestTarget());
        this.shootAnimation = () => (this.shootIceAnimation());
        break;
      case "cannon":
        this.name = "Cannon";
        this.damage = [150, 250, 400, 800, 1600];
        this.range = [100, 120, 140, 160, 180];
        this.price = [100, 100, 200, 400, 800];
        this.interval = [115, 110, 105, 100, 95];
        this.splash = [[0.4, 50], [0.45, 55], [0.5, 60], [0.55, 65], [0.6, 70]]; // amount, radius
        this.special = "splash";
        this.findTarget = () => (this.findClosestTarget());
        this.shootAnimation = () => (this.shootCannonAnimation());
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

    let svg = document.createElementNS(SVGNS, "g");
    let frame = document.createElementNS(SVGNS, "use");
    frame.setAttributeNS(XLINK_URL, "xlink:href", `#${this.type}_frame`);

    let towerSvg = document.createElementNS(SVGNS, "g");
    let towerChildSvg = document.createElementNS(SVGNS, "use");
    towerChildSvg.setAttributeNS(XLINK_URL, "xlink:href", `#${this.type}_tower`);
    towerSvg.appendChild(towerChildSvg);

    if (type === "arrow") {
      let bowstring1 = document.createElementNS(SVGNS, "line");
      bowstring1.setAttribute("class", "bowstring");
      bowstring1.setAttribute("x1", -2);
      bowstring1.setAttribute("y1", -12);
      bowstring1.setAttribute("x2", -2);
      bowstring1.setAttribute("y2", 0);
      towerSvg.appendChild(bowstring1);
      this.bowstring1 = bowstring1;

      let bowstring2 = document.createElementNS(SVGNS, "line");
      bowstring2.setAttribute("class", "bowstring");
      bowstring2.setAttribute("x1", -2);
      bowstring2.setAttribute("y1", 0);
      bowstring2.setAttribute("x2", -2);
      bowstring2.setAttribute("y2", 12);
      towerSvg.appendChild(bowstring2);
      this.bowstring2 = bowstring2;

    } else if (type === "ice") {
      let iceRod = document.createElementNS(SVGNS, "line");
      let iceHolder = document.createElementNS(SVGNS, "path");
      let iceGem = document.createElementNS(SVGNS, "circle");

      iceRod.setAttribute("x1", -15);
      iceRod.setAttribute("y1", 0);
      iceRod.setAttribute("x2", 7);
      iceRod.setAttribute("y2", 0);
      iceRod.setAttribute("class", "ice-rod");

      iceHolder.setAttribute("d", "M 13 -6 A 6 6 0 0 0 13 6 L 13 6");
      iceHolder.setAttribute("class", "ice-holder");

      iceGem.setAttribute("cx", 13);
      iceGem.setAttribute("cy", 0);
      iceGem.setAttribute("r", 4);
      iceGem.setAttribute("fill", "rgb(165, 242, 243)");
      iceGem.setAttribute("class", "ice-gem");

      iceHolder.setAttributeNS(XLINK_URL, "xlink:href", `#ice_holder`);
      iceGem.setAttributeNS(XLINK_URL, "xlink:href", `#ice_gem`);

      towerSvg.appendChild(iceRod);
      towerSvg.appendChild(iceHolder);
      towerSvg.appendChild(iceGem);

      this.iceRod = iceRod;
      this.iceHolder = iceHolder;
      this.iceGem = iceGem;
    }

    svg.appendChild(frame);
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

    $(this.svg).on("click", (e) => {
      this.handleClick(e);
    })
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
    // let id = "priority_" + this.priority + "_button";
    // selectedPriority = document.getElementById(id);
    // $(selectedPriority).attr("fill","rgb(70, 119, 187)");

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
  }

  refreshTowerDetails() {
    let level = this.level;

    $("#tower_details_name").text(this.name + " " + (level + 1));
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
      let bullet = new Bullet(this, target, this.game);
      this.shots++;
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
      if ((r < farthestVal) && (r - 10 <= this.range[this.level])) {
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

export default Tower;
