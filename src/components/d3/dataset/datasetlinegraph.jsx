import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";

class DatasetLinegraph extends Component {
  render() {
    var { dark, data, ylabel, yunits, xlabel, xunits, curve } = this.props;
    return (
      <React.Fragment>
        {data && (
          <D3LineGraph
            data={data}
            xlabel={xlabel}
            ylabel={ylabel}
            xunits={xunits}
            yunits={yunits}
            dark={dark}
            marginTop={20}
            lcolor={[]}
            lweight={[]}
            curve={curve}

          />
        )}
      </React.Fragment>
    );
  }
}

export default DatasetLinegraph;
