import React, { Component } from "react";
import Translate from "../../translations.json";
import { formatTime, formatDateLong } from "./functions";
import "./lake.css";
import SimpleLine from "../../components/d3/simpleline";

class Sidebar extends Component {
  state = {};
  render() {
    var {
      metadata,
      language,
      temperature,
      average,
      datetime,
      simpleline,
      dark,
    } = this.props;
    return (
      <div className="info">
        <div className="data">
          <div className="temperature">
            <div className="value" id="temperature_value">
              {temperature.toFixed(1)}
            </div>
            <div className="details">
              <div className="unit">°C</div>
              <div className="average">{average && "AVE"}</div>
            </div>
          </div>
          <div className="datetime">
            <div className="date" id="date_value">
              {formatDateLong(datetime, Translate.month[language])}
            </div>
            <div className="time" id="time_value">
              {formatTime(datetime)}
            </div>
          </div>
        </div>
        <div className="name">{metadata.name[language]}</div>
        <div className="graph">
          <SimpleLine
            simpleline={simpleline}
            datetime={datetime}
            temperature={temperature}
            formatDate={formatDateLong}
            formatTime={formatTime}
            language={language}
            dark={dark}
          />
          <div className="graph-parameter">
            {Translate.watertemperature[language]}
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
