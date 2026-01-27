import React, { Component } from "react";
import { Range, getTrackBackground } from "react-range";
import Translations from "../../translations.json";
import "./slider.css";

class RangeSlider extends Component {
  state = {
    hoverValue: null,
    draggingIndex: null,
  };

  formatDate = (datetime, months) => {
    var a = new Date(datetime);
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    return `${date} ${month} ${String(year)}`;
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

  componentDidUpdate() {}

  render() {
    var {
      period,
      timestep,
      selectedPeriod,
      setSelectedPeriod,
      language,
      permanentLabel,
    } = this.props;

    const values = selectedPeriod || [period[0], period[1]];

    return (
      <div className="slider-container">
        <Range
          label="Select your period"
          step={timestep}
          min={period[0]}
          max={period[1]}
          values={values}
          onChange={(newValues) => setSelectedPeriod(newValues)}
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
                  colors: ["#d3d3d36e", "#44bca77a", "#d3d3d36e"],
                  min: period[0],
                  max: period[1],
                  rtl: false,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index, isDragged }) => (
            <div
              {...props}
              key={props.key}
              className="slider-thumb"
              style={{
                ...props.style,
              }}
              onMouseDown={() => this.setState({ draggingIndex: index })}
              onMouseUp={() => this.setState({ draggingIndex: null })}
              onTouchStart={() => this.setState({ draggingIndex: index })}
              onTouchEnd={() => this.setState({ draggingIndex: null })}
            >
              <div className="slider-thumb-inner" />
              {(isDragged || permanentLabel) && (
                <div className="slider-thumb-label">
                  {this.formatDate(
                    values[index],
                    Translations.axis[language].months,
                  )}
                </div>
              )}
            </div>
          )}
        />
      </div>
    );
  }
}

export default RangeSlider;
