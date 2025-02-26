import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";
import Translations from "../../../translations.json";
import COLORS from "../../colors/colors.json";
import { extent } from "d3";

class TransectGraph extends Component {
  closestDate = (arr, target) => {
    let minDiff = Infinity;
    let closestIndex = null;
    for (let i = 0; i < arr.length; i++) {
      const diff = Math.abs(target - arr[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  };
  render() {
    var { data: input, options, datetime, dark, language } = this.props;
    var { paletteName } = options;
    const palette = COLORS[paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    let time = input.time.map((t) => new Date(t).getTime());
    let z =
      input["variables"]["temperature"].data[this.closestDate(time, datetime)];
    let zlabel = Translations.temperature[language];
    let zunits = input["variables"]["temperature"].unit;
    let y = input.depth.data;
    let ylabel = Translations.depth[language];
    let yunits = input.depth.unit;
    let x = input.distance.data.map((t) => t / 1000);
    let xlabel = Translations.transectDistance[language];
    let xunits = "km";
    var data = { x, y, z };
    let bounds = extent(input["variables"]["temperature"].data.flat(2));
    return (
      <D3HeatMap
        data={data}
        ylabel={ylabel}
        xlabel={xlabel}
        zlabel={zlabel}
        yunits={yunits}
        zunits={zunits}
        xunits={xunits}
        colors={palette}
        thresholdStep={200}
        yReverse={true}
        xReverse={false}
        display={"raster"}
        maxvalue={bounds[1]}
        minvalue={bounds[0]}
        bcolor={false}
        dark={dark}
      />
    );
  }
}

export default TransectGraph;
