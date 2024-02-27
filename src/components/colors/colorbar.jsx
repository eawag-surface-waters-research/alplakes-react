import React, { Component } from "react";
import "./colorbar.css";

class Colorbar extends Component {
  render() {
    var { min, max, palette, unit, text, onClick, id } = this.props;
    var colors = [];
    for (let p of palette) {
      colors.push(
        `rgb(${p.color[0]},${p.color[1]},${p.color[2]}) ${p.point * 100}%`
      );
    }
    var background = `linear-gradient(90deg, ${colors.join(", ")})`;
    return (
      <tr className="colorbar" onClick={() => onClick(id)}>
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
