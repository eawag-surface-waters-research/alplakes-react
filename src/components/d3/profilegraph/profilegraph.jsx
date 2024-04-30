import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";

class ProfileGraph extends Component {
  parseAPITime = (date) => {
    return new Date(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
        8,
        10
      )}:${date.slice(10, 12)}:00.000+00:00`
    );
  };
  render() {
    var { data: input, options } = this.props;
    var { thresholdStep, palette, variable } = options;
    let z = input[variable].data;
    let zlabel = variable.charAt(0).toUpperCase() + variable.slice(1);
    let zunits = input[variable].unit;
    let y = input.depth.data;
    let ylabel = "Depth";
    let yunits = input.depth.unit;
    let x = input.time.map((t) => this.parseAPITime(t));
    var data = { x, y, z };
    return (
      <React.Fragment>
        {data && (
          <D3HeatMap
            data={data}
            ylabel={ylabel}
            zlabel={zlabel}
            yunits={yunits}
            zunits={zunits}
            colors={palette}
            thresholdStep={thresholdStep}
            yReverse={true}
            xReverse={false}
            display={"heatmap"}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ProfileGraph;
