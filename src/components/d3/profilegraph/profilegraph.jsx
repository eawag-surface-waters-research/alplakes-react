import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";
import Translations from "../../../translations.json";
import COLORS from "../../colors/colors.json";

class ProfileGraph extends Component {
  render() {
    var { data: input, options, dark, language } = this.props;
    var { paletteName } = options;
    const palette = COLORS[paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    let z = input["variables"]["temperature"].data;
    let zlabel = Translations.temperature[language];
    let zunits = input["variables"]["temperature"].unit;
    let y = input.depth.data;
    let ylabel = Translations.depth[language];
    let yunits = input.depth.unit;
    let x = input.time.map((t) => new Date(t));
    var data = { x, y, z };
    return (
      <D3HeatMap
        data={data}
        ylabel={ylabel}
        zlabel={zlabel}
        xlabel={"time"}
        yunits={yunits}
        zunits={zunits}
        colors={palette}
        thresholdStep={200}
        yReverse={true}
        xReverse={false}
        display={"contour"}
        removeFullscreen={true}
        dark={dark}
      />
    );
  }
}

export default ProfileGraph;
