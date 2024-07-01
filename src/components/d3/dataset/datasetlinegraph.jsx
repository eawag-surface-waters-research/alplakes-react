import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import { deepCopy } from "./functions";

class DatasetLinegraph extends Component {
  render() {
    var { dark, data, ylabel, yunits, xlabel, xunits, curve, language } =
      this.props;
    var inputData = [];
    if (data !== undefined) {
      inputData = deepCopy(data);
    }
    return (
      <React.Fragment>
        {data && (
          <D3LineGraph
            data={inputData}
            xlabel={xlabel}
            ylabel={ylabel}
            xunits={xunits}
            yunits={yunits}
            dark={dark}
            marginTop={20}
            lcolor={[]}
            lweight={[]}
            curve={curve}
            language={language}
          />
        )}
      </React.Fragment>
    );
  }
}

export default DatasetLinegraph;
