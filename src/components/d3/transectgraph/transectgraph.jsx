import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";
import { extent } from "d3";

class TransectGraph extends Component {
  parseAPITime = (date) => {
    return new Date(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
        8,
        10
      )}:${date.slice(10, 12)}:00.000+00:00`
    );
  };
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
    var { data: input, options, datetime, dark } = this.props;
    var { thresholdStep, palette, variable } = options;
    let z = input[variable].data[this.closestDate(input.time, datetime)];
    let zlabel = variable.charAt(0).toUpperCase() + variable.slice(1);
    let zunits = input[variable].unit;
    let y = input.depth.data;
    let ylabel = "Depth";
    let yunits = input.depth.unit;
    let x = input.distance.map((t) => t / 1000);
    let xlabel = "Distance along transect";
    let xunits = "km";
    var data = { x, y, z };
    let bounds = extent(input[variable].data.flat(2));
    return (
      <React.Fragment>
        {data && (
          <D3HeatMap
            data={data}
            ylabel={ylabel}
            xlabel={xlabel}
            zlabel={zlabel}
            yunits={yunits}
            zunits={zunits}
            xunits={xunits}
            colors={palette}
            thresholdStep={thresholdStep}
            yReverse={true}
            xReverse={false}
            display={"contour"}
            maxvalue={bounds[1]}
            minvalue={bounds[0]}
            dark={dark}
          />
        )}
      </React.Fragment>
    );
  }
}

export default TransectGraph;
