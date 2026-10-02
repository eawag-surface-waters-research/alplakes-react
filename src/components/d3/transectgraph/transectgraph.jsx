import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";
import Translations from "../../../translations.json";
import COLORS from "../../colors/colors.json";
import { extent } from "d3";

class TransectGraph extends Component {
  heatmapRef = React.createRef();
  index = null;
  lastUpdate = 0;
  updateInterval = 100;

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

  parse = (input) => {
    if (this.parsed && this.parsedFrom === input) return this.parsed;
    this.parsedFrom = input;
    this.parsed = {
      time: input.time.map((t) => new Date(t).getTime()),
      z: input["variables"]["temperature"].data,
      y: input.depth.data,
      x: input.distance.data.map((t) => t / 1000),
      bounds: extent(input["variables"]["temperature"].data.flat(2)),
    };
    return this.parsed;
  };

  setPlayDatetime = (datetime) => {
    const now = performance.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    const { time, x, y, z } = this.parse(this.props.data);
    const index = this.closestDate(time, datetime);
    if (index === this.index) return;
    this.lastUpdate = now;
    this.index = index;
    if (this.heatmapRef.current)
      this.heatmapRef.current.updateData({ x, y, z: z[index] });
  };

  componentDidMount() {
    var { playUpdate } = this.props;
    if (playUpdate) playUpdate.setDatetime = this.setPlayDatetime;
  }

  componentWillUnmount() {
    var { playUpdate } = this.props;
    if (playUpdate && playUpdate.setDatetime === this.setPlayDatetime)
      playUpdate.setDatetime = null;
  }

  render() {
    var { data: input, options, datetime, dark, language } = this.props;
    var { paletteName } = options;
    const palette = COLORS[paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    let { time, x, y, z: zdata, bounds } = this.parse(input);
    this.index = this.closestDate(time, datetime);
    let z = zdata[this.index];
    let zlabel = Translations.temperature[language];
    let zunits = input["variables"]["temperature"].unit;
    let ylabel = Translations.depth[language];
    let yunits = input.depth.unit;
    let xlabel = Translations.transectDistance[language];
    let xunits = "km";
    var data = { x, y, z };
    return (
      <D3HeatMap
        ref={this.heatmapRef}
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
        removeFullscreen={true}
      />
    );
  }
}

export default TransectGraph;
