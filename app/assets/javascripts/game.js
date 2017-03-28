import Tower from "./tower";
const SVGNS = "http://www.w3.org/2000/svg";
const PATH_D = "M 180 0 L 180 140 L 100 140 L 100 420 L 300 420 L 300 100 L 620 100 L 620 220 L 420 220 L 420 340 L 800 340";
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

    this.buildPath();
    this.buildIndicators();
    this.loadTooltips();
    this.addListeners();
    this.newGame();
  }

  newGame() {
    this.gold = 240;
  }

  buildPath() {
    let path = document.createElementNS(SVGNS, "path");
    path.setAttribute("d", PATH_D);
    path.setAttribute("id", "path");
    path.setAttribute("class", "path");
    $("#game").append(path);
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
  }

  addFieldListeners() {
    let field = this.$field;
    field.on("mousemove", (e) => {
      this.mouseOverField(e);
    });

    field.on("click", (e) => {

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
      this.mouseLeaveBuy(e);
    });
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
    this.clearSelection();
    this.buy(e.target);
  }

  buy(svg) {
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
    if (this.selectedTower != null) {
      this.selectedTower.selected = false;
      $("#tower_details_group").attr("visibility", "hidden");
      this.selectedTower = null;
    }
    if (this.selectedMinion != null) {
      this.selectedMinion.selected = false;
      $("#minion_details_group").attr("visibility", "hidden");
      this.selectedMinion = null;
    }

    if ((this.building) && (keepCursorOn == undefined)) {
      this.building = false;
      $(`#buy_${this.buildingType}`).attr("class", `button buy ${this.buildingType}`);
    }
  }


  mouseOverBuy(e) {
    let svg = e.target;

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

    let details = this.getDetails(svg); // title, price, description

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
    let buttonType = svgClass.slice(svgClass.indexOf(" ") + 1, svgClass.length);
    switch (buttonType) {
        case "buy":
            let type = id.slice(id.indexOf("_") + 1, id.length);
            let tower = TOWERS[type]
            details[0] = `${tower.name} Tower (${tower.index})`;
            details[1] = `${tower.price} g`;
            details[2] = tower.description;
          break;
    }
    return details;
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

  mouseLeaveBuy(e) {
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
}

export default Game;
