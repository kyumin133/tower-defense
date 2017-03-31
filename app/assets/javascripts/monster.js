const SVGNS = "http://www.w3.org/2000/svg";
const XLINK_URL = "http://www.w3.org/1999/xlink";

const BASE_HP = 100;
const HP_INCREASE_RATIO = 1.25;
const BASE_BOUNTY = 10;
const BOUNTY_INCREASE_RATIO = 1.15;

class Monster {
  constructor(level, index, game) {
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

export default Monster;
