import React, { Component } from "react";
import "./loading.css";

class Loading extends Component {
  render() {
    var { marginTop } = this.props;
    return (
      <div
        className="loading-symbol"
        style={{ marginTop: marginTop ? marginTop : 0 }}
      >
        <span className="loader"></span>
      </div>
    );
  }
}

export default Loading;
