import React, { Component } from "react";
import { Range, getTrackBackground } from "react-range";
import Translate from "../../translations.json";
import "./slider.css";

class Slider extends Component {
  state = {
    hoverValue: null,
  };
  formatDateTime = (datetime, months) => {
    var a = new Date(datetime);
    var hour = a.getHours();
    var minute = a.getMinutes();
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    return `${hour < 10 ? "0" + hour : hour}:${
      minute < 10 ? "0" + minute : minute
    } ${date} ${month} ${String(year).slice(-2)}`;
  };
  calculateValueFromPosition = (event) => {
    var trackRef = document.getElementById("slider-track");
    const trackRect = trackRef.getBoundingClientRect();
    const relativePosition = event.clientX - trackRect.left;
    const percent = Math.min(
      Math.max(relativePosition / trackRect.width, 0),
      1
    );
    var min = parseFloat(trackRef.getAttribute("min"));
    var max = parseFloat(trackRef.getAttribute("max"));
    var step = parseFloat(trackRef.getAttribute("step"));
    return Math.round((min + percent * (max - min)) / step) * step;
  };

  handleMouseMove = (event) => {
    const value = this.calculateValueFromPosition(event);
    this.setState({ hoverValue: value });
  };

  handleMouseLeave = () => {
    this.setState({ hoverValue: null });
  };

  componentDidUpdate() {}

  render() {
    var { period, timestep, datetime, setDatetime, language } = this.props;
    var { hoverValue } = this.state;
    const values = [datetime];
    return (
      <div className="slider-container">
        <Range
          label="Select your value"
          step={timestep}
          min={period[0]}
          max={period[1]}
          values={values}
          onChange={(event) => setDatetime(event)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="slider-track"
              id="slider-track"
              step={timestep}
              min={period[0]}
              max={period[1]}
              onMouseMove={this.handleMouseMove}
              onMouseLeave={this.handleMouseLeave}
              style={{
                ...props.style,
                background: getTrackBackground({
                  values,
                  colors: ["#44bca77a", "#d3d3d3"],
                  min: period[0],
                  max: period[1],
                  rtl: false,
                }),
              }}
            >
              {hoverValue !== null && (
                <div className="slider-label">
                  {this.formatDateTime(
                    hoverValue,
                    Translate.axis[language].months
                  )}
                </div>
              )}
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              key={props.key}
              className="slider-thumb"
              style={{
                ...props.style,
              }}
            >
              <div className="slider-thumb-inner" />
            </div>
          )}
        />
      </div>
    );
  }
}

export default Slider;
