import React, { Component } from "react";
import topIcon from "../../img/top.png";
import "./scrollup.css";

class ScrollUp extends Component {
  state = {
    visible: false,
  };

  scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  toggleVisibility = () => {
    const threshold = window.innerHeight * 0.75;
    if (window.scrollY > threshold) {
      this.setState({ visible: true });
    } else {
      this.setState({ visible: false });
    }
  };

  componentDidMount() {
    window.addEventListener("scroll", this.toggleVisibility);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.toggleVisibility);
  }
  render() {
    const { visible } = this.state;
    return (
      <div className={visible ? "scroll-up" : "scroll-up hidden"} onClick={this.scrollToTop}>
        <img src={topIcon} alt="Scroll to top" />
      </div>
    );
  }
}

export default ScrollUp;
