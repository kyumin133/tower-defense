import Bullet from "./bullet";

const SVGNS = "http://www.w3.org/2000/svg";

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
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 35, 30, 25, 20];
        this.findTarget = () => (this.findFirstTarget());
        break;
      case "ice":
        this.name = "Ice";
        this.damage = [40, 80, 160, 320, 640];
        this.range = [100, 120, 140, 160, 180];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [60, 55, 50, 45, 40];
        this.slow = [[0.3, 100], [0.45, 120], [0.6, 140], [0.75, 160], [0.85, 200]]; // amount, duration
        this.special = "slow";
        this.findTarget = () => (this.findStrongestTarget());
        break;
      case "cannon":
        this.name = "Cannon";
        this.damage = [100, 200, 400, 800, 1600];
        this.range = [100, 115, 130, 145, 160];
        this.price = [100, 100, 200, 400, 800];
        this.interval = [120, 115, 110, 105, 100, 95];
        this.splash = [[0.3, 50], [0.35, 55], [0.4, 60], [0.45, 65], [0.5, 70]]; // amount, radius
        this.special = "splash";
        this.findTarget = () => (this.findClosestTarget());
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
        break;
    }

    let svg = document.createElementNS(SVGNS, "rect");
    svg.setAttribute("x", pos[0]);
    svg.setAttribute("y", pos[1]);

    let length = 40;
    this.cx = this.pos[0] + 0.5 * length;
    this.cy = this.pos[1] + 0.5 * length;

    svg.setAttribute("id", `type_${pos[0]}_${pos[1]}}`);
    svg.setAttribute("class", `tower ${type}`);
    $("#game").append(svg);
    this.svg = svg;

    $(this.svg).on("click", (e) => {
      this.handleClick(e);
    })
  }

  handleClick(e) {
    let game = this.game;
    game.clearSelection(true);
    game.selectedTower = this;

    let oldClass = $(this.svg).attr("class");
    $(this.svg).attr("class", `tower ${this.type}-selected`)

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
  }

  shoot() {
    if(this.game.monsterQueue.length === 0) {
      return;
    }

    let target = this.findTarget();

    if (!!target) {
      // let bullet = new Bullet(this, target);
      console.log(target);
      this.shots++;
    } else {
      return;
    }
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");

      if(monster.svg.getAttribute("class") == "hidden-monster") {
        continue;
      }

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((r < closestVal) && (r <= this.range)) {
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");

      if(monster.svg.getAttribute("class") == "hidden-monster") {
        continue;
      }

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((r < farthestVal) && (r <= this.range)) {
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");

      let r = this.game.getDistance(this.cx, this.cy, p.x, p.y);
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r > this.range)) {
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r > this.range)) {
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r > this.range)) {
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

      p.x = monster.svg.getAttribute("cx");
      p.y = monster.svg.getAttribute("cy");
      if ((monster.svg.getAttribute("class") == "hidden-monster") || (r > this.range)) {
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
