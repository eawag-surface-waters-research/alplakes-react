import React, { Component } from "react";
import "./toggle.css";

class Toggle extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
  };
  render() {
    var { id } = this.state;
    var { left, right, onChange, checked } = this.props;
    return (
      <div className="toggle">
        <input
          type="checkbox"
          id={"toggle " + id}
          className="toggleCheckbox"
          onChange={onChange}
          checked={checked}
        />
        <label htmlFor={"toggle " + id} className="toggleContainer">
          <div>{left}</div>
          <div>{right}</div>
        </label>
      </div>
    );
  }
}

export default Toggle;
