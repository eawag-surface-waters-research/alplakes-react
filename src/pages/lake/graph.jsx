import React, { Component } from "react";
import Toggle from "../../components/sliders/toggle";

class Graph extends Component {
  state = {
    annual: false,
  };
  toggleAnnual = () => {
    this.setState({ annual: !this.state.annual });
  };
  render() {
    var { annual } = this.state;
    return (
      <React.Fragment>
        <div className="settings">
          <Toggle
            left="Timeframe"
            right="Annual"
            onChange={this.toggleAnnual}
            checked={annual}
          />
        </div>
        <div className="view-area">
          <div className="graph-area"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default Graph;
