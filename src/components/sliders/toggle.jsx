import React, { Component } from "react";
import "./toggle.css";

class Toggle extends Component {
  render() {
    var { left, right, onChange, checked } = this.props;
    return (
      <React.Fragment>
        <input
          type="checkbox"
          id="toggle"
          className="toggleCheckbox"
          onChange={onChange}
          checked={checked}
        />
        <label htmlFor="toggle" className="toggleContainer">
          <div>{left}</div>
          <div>{right}</div>
        </label>
      </React.Fragment>
    );
  }
}

export default Toggle;
