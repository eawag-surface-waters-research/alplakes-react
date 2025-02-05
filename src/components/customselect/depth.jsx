import React, { Component } from "react";
import Translations from "../../translations.json";

const closestValue = (target, arr) => {
  const sortedArr = arr
    .slice()
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return sortedArr[0];
};

class Depth extends Component {
  state = {
    depth: 0,
    depths: [],
    step: 0.1,
    min: 0,
    max: 1,
  };
  updateDepth = (event) => {
    var { depths } = this.props;
    var depth = closestValue(parseFloat(event.target.value), depths);
    this.setState({ depth });
  };
  setDepth = () => {
    var { onChange } = this.props;
    var { depth } = this.state;
    onChange(depth);
  };
  componentDidMount() {
    var { depth, depths } = this.props;
    if (depths && depths.length > 0) {
      var min = Math.min(...depths);
      var max = Math.max(...depths);
      this.setState({ depth, min, max, depths });
    } else {
      this.setState({ depth });
    }
  }
  componentDidUpdate() {
    var { depths } = this.props;
    if (depths && this.state.depths.length !== depths.length) {
      var min = Math.min(...depths);
      var max = Math.max(...depths);
      this.setState({ min, max, depths });
    }
  }
  render() {
    var { depth, step, min, max, depths } = this.state;
    const { language } = this.props;
    return (
      <React.Fragment>
        <div className="setting">
          <div className="label">{Translations.depth[language]} (m)</div>
          <div className="value">
            <select
              value={depth}
              onChange={this.updateDepth}
              className="subtle"
            >
              {depths.map((d) => (
                <option value={d} key={d}>
                  {d}
                </option>
              ))}
            </select>
            <button className="set" onClick={this.setDepth}>
              {Translations.setDepth[language]}
            </button>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={depth}
            onChange={this.updateDepth}
          ></input>
        </div>
      </React.Fragment>
    );
  }
}

export default Depth;
