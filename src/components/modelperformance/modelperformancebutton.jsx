import React, { Component } from "react";
import Translations from "../../translations.json";
import { parameterConfig, rmseColor } from "./parameters";
import "./modelperformance.css";

class ModelPerformanceButton extends Component {
  render() {
    var { rmse, language, open, parameter } = this.props;
    const { unit } = parameterConfig(parameter);
    return (
      <div
        className="model-performance-button"
        title={Translations.modelPerformance[language]}
        onClick={open}
      >
        <div
          className="circle"
          style={{ backgroundColor: rmseColor(rmse, parameter) }}
        />
        &#177; {rmse}
        {unit === "°C" ? unit : ` ${unit}`}
      </div>
    );
  }
}

export default ModelPerformanceButton;
