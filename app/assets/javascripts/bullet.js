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
          console.log(r);
          if (r <= this.tower.splash[this.tower.level][1]) {
            this.onHit(true, damage * this.tower.splash[this.tower.level][0], monster);
          }
        }
      }
    }
}

export default Bullet;
