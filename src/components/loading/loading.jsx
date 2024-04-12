import React, { Component } from "react";
import "./loading.css";

class Loading extends Component {
  render() {
    return (
      <div className="ytp-spinner" data-layer="4">
        <div>
          <div className="ytp-spinner-container">
            <div className="ytp-spinner-rotator">
              <div className="ytp-spinner-left">
                <div className="ytp-spinner-circle"></div>
              </div>
              <div className="ytp-spinner-right">
                <div className="ytp-spinner-circle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Loading;
