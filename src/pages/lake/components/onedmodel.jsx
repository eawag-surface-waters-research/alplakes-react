import React, { Component } from "react";
import Translations from "../../../translations.json";

class OneDModel extends Component {
  render() {
    var { language } = this.props;
    return (
      <div className="onedmodel">
        <h3>{Translations.watertemperature[language]} - 1D</h3>
      </div>
    );
  }
}

export default OneDModel;
