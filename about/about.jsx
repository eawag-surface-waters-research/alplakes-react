import React, { Component } from "react";
import Translate from "../src/translations.json";
import NavBar from "../src/components/navbar/navbar";

class About extends Component {
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
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
