import React, { Component } from "react";
import "./loading.css";

class Loading extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="loading-symbol-x10">
          <span className="loader-x10" />
        </div>
      </React.Fragment>
    );
  }
}

export default Loading;
