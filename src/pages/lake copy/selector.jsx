import React, { Component } from "react";
import Toggle from "../../components/sliders/toggle";

class Selector extends Component {
  toggleActive = () => {
    var { active, setActive } = this.props;
    if (active === "map") {
      setActive("graph");
    } else {
      setActive("map");
    }
  };
  render() {
    var { active, setActive } = this.props;
    return (
      <React.Fragment>
        <div className="selector desktop">
          <Toggle
            left="Map"
            right="Graph"
            onChange={this.toggleActive}
            checked={active === "graph"}
          />
        </div>
        <div className="selector mobile">
          <div
            className={`selectable ${active === "details" ? "active" : ""}`}
            onClick={() => setActive("details")}
          >
            Details
          </div>
          <div
            className={`selectable ${active === "map" ? "active" : ""}`}
            onClick={() => setActive("map")}
          >
            Map
          </div>
          <div
            className={`selectable ${active === "graph" ? "active" : ""}`}
            onClick={() => setActive("graph")}
          >
            Graph
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Selector;
