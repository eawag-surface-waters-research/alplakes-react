import React, { Component } from "react";
import Translations from "../../translations.json";
import "./modelperformance.css";

class ModelPerformanceButton extends Component {
  render() {
    var { rmse, language, open } = this.props;
    var rmse_color = "#76b64b";
    if (rmse >= 2) {
      rmse_color = "#f34b3e";
    } else if (rmse >= 1) {
      rmse_color = "#fbd247";
    }
    return (
      <div
        className="model-performance-button"
        title={Translations.modelPerformance[language]}
        onClick={open}
      >
        <div className="circle" style={{ backgroundColor: rmse_color }} />
        &#177; {rmse}°C
      </div>
    );
  }
}

export default ModelPerformanceButton;
