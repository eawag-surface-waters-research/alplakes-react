import React, { Component } from "react";
import "./loading.css";

class Loading extends Component {
  render() {
    var { marginTop, dark } = this.props;
    return (
      <div
        className={dark ? "box-loader dark" : "box-loader"}
        style={{ marginTop: marginTop ? marginTop : 0 }}
      ></div>
    );
  }
}

export default Loading;
