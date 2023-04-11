import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";

class About extends Component {
  render() {
    var { language } = this.props;
    return (
      <div className="main">
        <NavBar {...this.props} />
        <div className="primary">
          <div className="content"></div>
        </div>
        <div className="secondary"></div>
      </div>
    );
  }
}

export default About;
