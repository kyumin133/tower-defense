## BugDefense
[Live link][gh-pages]
BugDefense is a [tower defense game][wikipedia] written using JavaScript, jQuery, and SVG.

[gh-pages]: https://kyumin133.github.io/tower-defense/
[wikipedia]: https://en.wikipedia.org/wiki/Tower_defense

### Instructions
  The object of the game is to prevent monsters from reaching the end of the path by shooting at them using towers. Monsters give gold when killed, which players can use to buy and upgrade towers.

  Pressing Space starts the next level, and pressing P pauses/unpauses the game. Players buy towers from the shop by clicking on the icons and then clicking on the desired spot on the field. Players can also upgrade their towers or sell them to recoup some of the costs.

### Technology Used
  BugDefense uses SVG (Scalable Vector Graphics) to draw all the elements. All icons (e.g. bugs, bullets, tower animations) are original content created through SVG.

  JavaScript and jQuery are used to handle the game logic and manipulate the SVG.

### Technical Implementation Details
#### Creating SVG Content
Many SVG elements in BugDefense have to be drawn multiple times. One example are arrows that Arrow Towers fire. By putting this in the ```<defs>``` section of the ```<svg>``` tag, new instances of this shape can be easily drawn.

Definition:
  ```html
  <defs>
    ...
    <g id="arrow" fill="transparent">
      <rect stroke="black" stroke-width="0.3" fill="#855E42" x="-0.5" y="-6" height="20" width="1" />
      <polygon fill="rgb(180, 180, 180)" stroke="black" stroke-width="0.3" points="0 -6, 1.5 -4.5, 0 -9, -1.5 -4.5, 0 -6" />
      <polygon fill="rgb(17,105,9)" stroke="black" stroke-width="0.3" points="0 12, 2.5 14.5, 2.5 18.5, 0 16, -2.5 18.5, -2.5 14.5, 0, 12" />
      <line stroke="black" stroke-width="0.3" x1="0" y1="12" x2="0" y2="16" />
      <line stroke="black" stroke-width="0.3" x1="0" y1="14" x2="2.5" y2="16.5" />
      <line stroke="black" stroke-width="0.3" x1="0" y1="14" x2="-2.5" y2="16.5" />
    </g>
    ...
  </defs>
  ```

Creating a new instance:
```javascript
  const SVGNS = "http://www.w3.org/2000/svg";
  const XLINK_URL = "http://www.w3.org/1999/xlink";

  class Bullet() {
    constructor() {
      ...
      let bulletSvg = document.createElementNS(SVGNS, "use");
      bulletSvg.setAttributeNS(XLINK_URL, "xlink:href", `arrow`);
      $("#game").append(bulletSvg);
      ...
    }
  }

```
#### Target Seeking
Towers first determine 

### Future Features
- More tower types
- Animations upon bullet impact
- "Global" upgrades that impact all towers of certain types
- More diverse monster types
