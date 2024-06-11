import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";

class DatasetHeatmap extends Component {
  render() {
    var {
      thresholdStep,
      palette,
      dark,
      data,
      ylabel,
      yunits,
      zlabel,
      zunits,
      xlabel,
      xunits,
      language
    } = this.props;
    return (
      <React.Fragment>
        {data && (
          <D3HeatMap
            data={data}
            xlabel={xlabel}
            ylabel={ylabel}
            zlabel={zlabel}
            xunits={xunits}
            yunits={yunits}
            zunits={zunits}
            colors={palette}
            thresholdStep={thresholdStep}
            yReverse={true}
            xReverse={false}
            display={"contour"}
            dark={dark}
            language={language}
          />
        )}
      </React.Fragment>
    );
  }
}

export default DatasetHeatmap;
