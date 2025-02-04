import React, { Component } from "react";
import arrow from "../../img/blue_arrow.png";
import "./expand.css";

class Expand extends Component {
  state = {
    open: false,
  };
  toggle = () => {
    this.setState({ open: !this.state.open }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  render() {
    const { content, openLabel, closeLabel } = this.props;
    const { open } = this.state;
    return (
      <div className="sidebar-expand">
        <div className={open ? "expand-content" : "expand-content closed"}>
          {content}
        </div>
        <div className="expand-button" onClick={this.toggle}>
          {open ? closeLabel : openLabel}
          <img src={arrow} alt="Arrow" className={open ? "rotate" : ""} />
        </div>
      </div>
    );
  }
}

export default Expand;
