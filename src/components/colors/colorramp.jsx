import React, { Component } from "react";
import "./colorramp.css";
import COLORS from "./colors.json";

class ColorRamp extends Component {
  state = {
    open: false,
    selected: "vik",
    palettes: Object.fromEntries(
      Object.entries(COLORS).map(([key, colors]) => [
        key,
        colors.map((c) => {
          return { color: [c[0], c[1], c[2]], point: c[3] };
        }),
      ])
    ),
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

  selectColorRamp = (selected) => {
    this.setState({ selected, open: false });
    if ("onChange" in this.props) {
      var { palettes } = this.state;
      var { onChange } = this.props;
      var palette = JSON.parse(JSON.stringify(palettes[selected]));
      onChange({ name: selected, palette });
    }
  };

  linearGradient = (colors) => {
    if (colors) {
      var lineargradient = [];
      for (var color of colors) {
        lineargradient.push(
          `rgb(${color.color.join(",")}) ${color.point * 100}%`
        );
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
    if ("value" in this.props) {
      selectStyle = {
        background: this.linearGradient(this.props.value),
      };
    }

    return (
      <div className="colorramp">
        <div
          className="colorramp-select"
          onClick={this.toggle}
          style={selectStyle}
        ></div>
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
