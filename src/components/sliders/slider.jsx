import React, { Component } from "react";
import { Range, getTrackBackground } from "react-range";
import Translations from "../../translations.json";
import "./slider.css";

class Slider extends Component {
  state = {
    hoverValue: null,
    displayDatetime: null,
  };
  _rafId = null;
  _startTime = null;
  _startDatetime = null;
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
      1,
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

  _startPlayLoop = () => {
    var { period, timestep, duration, datetime } = this.props;
    var range = period[1] - period[0];
    var speed = range / duration;
    this._startTime = performance.now();
    this._startDatetime = datetime;

    var tick = (now) => {
      if (!this.props.play) return;
      var elapsed = now - this._startTime;
      var dt = this._startDatetime + elapsed * speed;
      if (dt >= period[1]) {
        this._startTime = now;
        this._startDatetime = period[0];
        dt = period[0];
      }
      dt = Math.round((dt - period[0]) / timestep) * timestep + period[0];
      this.setState({ displayDatetime: dt });
      this._rafId = requestAnimationFrame(tick);
    };

    this._rafId = requestAnimationFrame(tick);
  };

  _stopPlayLoop = () => {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
    this.setState({ displayDatetime: null });
  };

  componentDidUpdate(prevProps) {
    if (this.props.play && !prevProps.play) {
      this._startPlayLoop();
    } else if (!this.props.play && prevProps.play) {
      this._stopPlayLoop();
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._rafId);
  }

  render() {
    var { period, timestep, datetime, setDatetime, language, permanentLabel, play } =
      this.props;
    var { hoverValue, displayDatetime } = this.state;
    var currentDatetime = play && displayDatetime !== null ? displayDatetime : datetime;
    const values = [currentDatetime];
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
                  colors: ["#44bca77a", "#d3d3d36e"],
                  min: period[0],
                  max: period[1],
                  rtl: false,
                }),
              }}
            >
              {(hoverValue !== null || permanentLabel) && (
                <div className="slider-label">
                  {this.formatDateTime(
                    hoverValue !== null ? hoverValue : currentDatetime,
                    Translations.axis[language].months,
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
