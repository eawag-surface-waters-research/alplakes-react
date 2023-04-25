import React, { Component } from "react";
import "./colorramp.css";
import COLORS from "./colors.json";

class ColorRamp extends Component {
  state = {
    open: false,
    selected: "Balance",
    palettes: COLORS,
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  closeEvent = (event) => {
    var { open } = this.state;
    var targetClass = "noclassselected";
    try {
      targetClass = event.target.attributes.class.value;
    } catch (e) {}
    var classes = [
      "colorramp-select",
      "colorramp-dropdown",
      "colorramp-option",
    ];
    if (!classes.includes(targetClass) && open) {
      this.setState({ open: false });
    }
  };

  selectColorRamp = (index) => {
    this.setState({ selected: index, open: false });
    if ("onChange" in this.props) {
      var { palettes } = this.state;
      var { onChange } = this.props;
      var ramp = JSON.parse(JSON.stringify(palettes[index].data));
      onChange(ramp);
    }
  };

  linearGradient = (colors) => {
    if (colors) {
      var lineargradient = [];
      for (var color of colors) {
        lineargradient.push(`rgb(${color.color.join(",")}) ${color.point * 100}%`);
      }
      return `linear-gradient(90deg, ${lineargradient.join(", ")})`;
    }
  };

  componentDidMount() {
    window.addEventListener("click", this.closeEvent);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.closeEvent);
  }

  render() {
    var { palettes, selected, open } = this.state;
    var selectStyle = {
      background: this.linearGradient(palettes[selected]),
    };
    if ("palette" in this.props) {
      selectStyle = {
        background: this.linearGradient(this.props.palette),
      };
    }

    return (
      <div className="colorramp">
        <div
          className="colorramp-select"
          onClick={this.toggle}
          style={selectStyle}
        >
          <div className="colorramp-arrow">{open ? "<" : ">"}</div>
        </div>
        <div
          className={open ? "colorramp-dropdown" : "colorramp-dropdown hide"}
        >
          {Object.keys(palettes).map((key) => {
            var style = {
              background: this.linearGradient(palettes[key]),
            };
            return (
              <div
                className="colorramp-option"
                key={key}
                style={style}
                onClick={() => this.selectColorRamp(key)}
              >
                {key}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorRamp;
