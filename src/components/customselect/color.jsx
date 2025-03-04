import React, { Component } from "react";

class Color extends Component {
  state = {
    id: "color_" + Math.round(Math.random() * 100000),
  };
  onClick = () => {
    var { id } = this.state;
    const colorPicker = document.getElementById(id);
    colorPicker.focus();
    colorPicker.click();
  };
  render() {
    var { value, onChange } = this.props;
    var { id } = this.state;
    return (
      <div className="color" onClick={this.onClick}>
        <div
          id="colorBox"
          className="color-box"
          style={{ backgroundColor: value }}
        ></div>
        <input
          type="color"
          id={id}
          style={{ opacity: 0 }}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }
}

export default Color;
