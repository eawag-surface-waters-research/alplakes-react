import React, { Component } from "react";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";

class API extends Component {
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content"></div>
        </div>
        <div className="secondary"></div>
      </div>
    );
  }
}

export default API;
