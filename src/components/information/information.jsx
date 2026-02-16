import React, { Component } from "react";
import "./information.css";

class Information extends Component {
  render() {
    const { information, above, small, box } = this.props;
    var className = "information";
    if (above) className += " above";
    if (small) className += " small";
    if (box) className += " box";
    return (
      <div className={className}>
        <div className="information-symbol">?</div>
        <div className="information-box">{information}</div>
      </div>
    );
  }
}

export default Information;
