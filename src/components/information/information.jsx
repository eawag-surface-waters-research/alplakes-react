import React, { Component } from "react";
import "./information.css";

class Information extends Component {
  render() {
    const { information } = this.props;
    return (
        <div className="information">
          <div className="information-symbol">?</div>
          <div className="information-box">{information}</div>
        </div>
    );
  }
}

export default Information;
