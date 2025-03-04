import React, { Component } from "react";
import COLORS from "./colors.json";
import "./colorbar.css";

class Colorbar extends Component {
  render() {
    var { min, max, paletteName, unit, text } = this.props;
    const palette = COLORS[paletteName];
    var colors = [];
    for (let p of palette) {
      colors.push(`rgb(${p[0]},${p[1]},${p[2]}) ${p[3] * 100}%`);
    }
    var background = `linear-gradient(90deg, ${colors.join(", ")})`;
    return (
      <tr className="colorbar">
        <td>
          {min}
          {unit}
        </td>
        <td className="bar" style={{ background: background }}>
          {text}
        </td>
        <td>
          {max}
          {unit}
        </td>
      </tr>
    );
  }
}

export default Colorbar;
