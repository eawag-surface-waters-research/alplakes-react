import React, { Component } from "react";
import Translate from "../../translations.json";
import {
  formatTime,
  formatDateLong,
} from "./functions";
import "./lake.css";
import SimpleLine from "../../components/d3/simpleline";

class Sidebar extends Component {
  state = {};
  render() {
    var { metadata, language, temperature, average, datetime, simpleline } = this.props;
    return (
      <div className="info">
        
        <div className="data">
          <div className="temperature">
            <div className="value">{temperature}</div>
            <div className="details">
              <div className="unit">°C</div>
              <div className="average">{average && "AVE"}</div>
            </div>
          </div>
          <div className="datetime">
            <div className="date">
              {formatDateLong(datetime, Translate.month[language])}
            </div>
            <div className="time">{formatTime(datetime)}</div>
          </div>
        </div>
        <div className="name">{metadata.name[language]}</div>
        <div className="graph">
          <SimpleLine simpleline={simpleline} datetime={datetime} />
        </div>
        
      </div>
    );
  }
}

export default Sidebar;
