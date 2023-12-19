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
          class="toggleCheckbox"
          onChange={onChange}
          checked={checked}
        />
        <label for="toggle" class="toggleContainer">
          <div>{left}</div>
          <div>{right}</div>
        </label>
      </React.Fragment>
    );
  }
}

export default Toggle;
