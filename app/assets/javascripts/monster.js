const SVGNS = "http://www.w3.org/2000/svg";

const BASE_HP = 100;
const HP_INCREASE_RATIO = 1.25;
const BASE_BOUNTY = 10;
const BOUNTY_INCREASE_RATIO = 1.15;

class Monster {
  constructor(level, index, game) {
    this.game = game;

    let svg = document.createElementNS(SVGNS, "circle");
    $(svg).attr("class", "hidden-monster");
    svg.setAttribute("cx", game.pathStart.x);
    svg.setAttribute("cy", game.pathStart.y);
    svg.setAttribute("r", 10);

    $("#game").append(svg);
    this.svg = svg;

    this.maxHp = BASE_HP * (HP_INCREASE_RATIO ** (level - 1));
    this.hp = this.maxHp;

    this.timeToFinish = 30000; //ms from beginning to end

    if (index === 0) {
      this.alive = true;
      svg.setAttribute("class", "monster");

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

    this.bounty = BASE_BOUNTY * (BOUNTY_INCREASE_RATIO ** (level - 1));
    this.selected = false;

    this.game.monsterQueue.push(this);

    $(this.svg).on("click", (e) => {
      this.game.clearSelection();
      this.game.selectedMonster = this;
      this.selected = true;

      $(this.svg).attr("class", "monster selected-monster");
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
}

export default Monster;
