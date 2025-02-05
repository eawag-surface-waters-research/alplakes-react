import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import { deepCopy } from "./functions";

class DatasetLinegraph extends Component {
  render() {
    var {
      dark,
      data,
      ylabel,
      yunits,
      xlabel,
      xunits,
      curve,
      language,
      padding,
      grid
    } = this.props;
    var inputData = [];
    if (data !== undefined) {
      inputData = deepCopy(data);
    }
    return (
      <div
        className={
          padding === true ? "dataset-linegraph padding" : "dataset-linegraph"
        }
      >
        {data && (
          <D3LineGraph
            data={inputData}
            xlabel={xlabel}
            ylabel={ylabel}
            xunits={xunits}
            yunits={yunits}
            dark={dark}
            marginTop={1}
            marginRight={1}
            marginBottom={xlabel === "time" ? 20 : 35}
            lcolor={[]}
            lweight={[]}
            curve={curve}
            language={language}
            grid={grid}
          />
        )}
      </div>
    );
  }
}

export default DatasetLinegraph;
