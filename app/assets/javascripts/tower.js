const SVGNS = "http://www.w3.org/2000/svg";

class Tower {
  constructor(type, pos) {
    this.level = 1;
    this.pos = pos;

    switch (type) {
      case "arrow":
        this.damage = [30, 60, 120, 240, 480];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 35, 30, 25, 20];
      case "ice":
        this.damage = [30, 60, 120, 240, 480];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 35, 30, 25, 20];
        this.slow = [[0.3, 100], [0.45, 120], [0.6, 140], [0.75, 160], [0.85, 200]]; // amount, duration
      case "cannon":
        this.damage = [30, 60, 120, 240, 480];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 35, 30, 25, 20];
        this.splash = [[0.3, 50], [0.35, 55], [0.4, 60], [0.45, 65], [0.5, 70]]; // amount, radius
      case "assassin":
        this.damage = [30, 60, 120, 240, 480];
        this.range = [120, 140, 160, 180, 200];
        this.price = [60, 60, 120, 240, 480];
        this.interval = [40, 35, 30, 25, 20];
        this.percentMissing = [8, 11, 14, 17, 20];
    }

    let svg = document.createElementNS(SVGNS, "rect");
    svg.setAttribute("x", pos[0]);
    svg.setAttribute("y", pos[1]);
    svg.setAttribute("id", `type_${pos[0]}_${pos[1]}}`);
    svg.setAttribute("class", `tower ${type}`);
    $("#game").append(svg);
    this.svg = svg;
  }
}

export default Tower;
