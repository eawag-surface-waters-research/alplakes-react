import React, { Component } from "react";
import "./togglebox.css";

class ToggleBox extends Component {
  render() {
    const { open, title, set, content, toggleDisplay } = this.props;
    return (
      <div className="toggle-box">
        <div className="toggle-box-header">
          <div className="setting">
            <label className="switch">
              <input
                type="checkbox"
                checked={open}
                onChange={() => toggleDisplay(set)}
              />
              <span className="slider round"></span>
            </label>
            <div className="title">{title}</div>
          </div>
        </div>
        <div
          className={open ? "toggle-box-content" : "toggle-box-content hide"}
        >
          {content}
        </div>
      </div>
    );
  }
}

export default ToggleBox;
