import React, { Component } from "react";
import * as d3 from "d3";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";
import "../linegraph/linegraph.css";
import "./wavetimeseries.css";

class HeightLineGraph extends Component {
  shouldComponentUpdate(next) {
    const keys = [
      "data",
      "fontSize",
      "dark",
      "language",
      "marginLeft",
      "marginRight",
      "marginTop",
      "marginBottom",
      "xmin",
      "xmax",
    ];
    return keys.some((k) => next[k] !== this.props[k]);
  }

  render() {
    return <D3LineGraph {...this.props} />;
  }
}

class WaveTimeseriesGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    width: 0,
    height: 0,
    fullscreen: false,
    fontSize: this.props.fontSize ? this.props.fontSize : 12,
    hover: null,
    // Visible time window [startMs, endMs]; null = full extent.
    domain: null,
  };

  componentDidMount() {
    this.observer = new ResizeObserver(() => this.measure());
    if (this.wrapper) this.observer.observe(this.wrapper);
    this.measure();
    // Native (non-passive) wheel listener so we can preventDefault while zooming.
    if (this.wrapper)
      this.wrapper.addEventListener("wheel", this.handleWheel, {
        passive: false,
      });
  }

  componentWillUnmount() {
    if (this.observer) this.observer.disconnect();
    if (this.wrapper)
      this.wrapper.removeEventListener("wheel", this.handleWheel);
  }

  measure = () => {
    if (!this.wrapper) return;
    const { width, height } = this.wrapper.getBoundingClientRect();
    if (width !== this.state.width || height !== this.state.height) {
      this.setState({ width, height });
    }
  };

  editFontSize = (event) => {
    this.setState({ fontSize: parseInt(event.target.value) });
  };

  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
      this.measure();
    });
  };

  series = () => {
    const { data } = this.props;
    const variables = data.variables || {};
    return {
      times: (data.time || []).map((t) => new Date(t)),
      heights: (variables.significant_wave_height || {}).data || [],
      periods: (variables.mean_wave_period || {}).data || [],
      directions: (variables.wave_direction || {}).data || [],
      heightUnit: (variables.significant_wave_height || {}).unit || "m",
      periodUnit: (variables.mean_wave_period || {}).unit || "s",
    };
  };

  getLineData = () => {
    const { dark } = this.props;
    if (this._ldData !== this.props.data || this._ldDark !== dark) {
      const { heights } = this.series();
      this._ldData = this.props.data;
      this._ldDark = dark;
      this._lineData = {
        x: (this.props.data.time || []).map((t) => new Date(t)),
        y: heights,
        upper: heights,
        lower: heights.map(() => 0),
        confidenceAxis: "y",
        lineColor: dark ? "#75e0f6" : "#1f6f9e",
        lineWeight: 2,
      };
    }
    return this._lineData;
  };

  margins = () => {
    const { fontSize } = this.state;
    return {
      left: fontSize * 3 + 20,
      right: 18,
      top: fontSize * 4 + 18,
      bottom: fontSize * 2 + 14,
    };
  };

  directionAngle = (deg) => {
    const u = Math.sin(((deg + 180) * Math.PI) / 180);
    const v = Math.cos(((deg + 180) * Math.PI) / 180);
    return (Math.atan2(-v, u) * 180) / Math.PI;
  };

  // Minimum visible window (cap on zoom-in).
  MIN_SPAN = 2 * 3600 * 1000;

  // Current x scale plus the visible / full time windows, used by both the
  // render and the wheel/pan handlers so everything stays aligned.
  scaleX = () => {
    const m = this.margins();
    const pw = Math.max(0, this.state.width - m.left - m.right);
    const { times } = this.series();
    const full = [
      times.length ? times[0].getTime() : 0,
      times.length ? times[times.length - 1].getTime() : 0,
    ];
    const view = this.state.domain || full;
    const x = d3
      .scaleTime()
      .domain(view)
      .range([m.left, m.left + pw]);
    return { x, view, full, pw, m };
  };

  handleWheel = (event) => {
    if (!this.state.width || this.series().times.length < 2) return;
    event.preventDefault();
    const { x, view, full } = this.scaleX();
    const rect = this.wrapper.getBoundingClientRect();
    const center = x.invert(event.clientX - rect.left).getTime();
    const maxSpan = full[1] - full[0];
    const factor = event.deltaY > 0 ? 1.25 : 0.8;
    let span = Math.min(maxSpan, Math.max(this.MIN_SPAN, (view[1] - view[0]) * factor));
    if (span >= maxSpan) {
      this.setState({ domain: null });
      return;
    }
    const frac = (center - view[0]) / (view[1] - view[0] || 1);
    let start = center - frac * span;
    let end = start + span;
    if (start < full[0]) [start, end] = [full[0], full[0] + span];
    if (end > full[1]) [start, end] = [full[1] - span, full[1]];
    this.setState({ domain: [start, end] });
  };

  startPan = (event) => {
    this._panning = true;
    this._lastX = event.clientX;
  };

  endPan = () => {
    this._panning = false;
  };

  onMove = (event) => {
    if (!this.state.width || this.series().times.length < 2) return;
    const { x, view, full, pw } = this.scaleX();
    const rect = this.wrapper.getBoundingClientRect();
    if (this._panning) {
      const span = view[1] - view[0];
      const dt = (-(event.clientX - this._lastX) * span) / (pw || 1);
      this._lastX = event.clientX;
      let start = view[0] + dt;
      let end = view[1] + dt;
      if (start < full[0]) [start, end] = [full[0], full[0] + span];
      if (end > full[1]) [start, end] = [full[1] - span, full[1]];
      this.setState({ domain: [start, end] });
      return;
    }
    const { times } = this.series();
    const t = x.invert(event.clientX - rect.left);
    const bisect = d3.bisector((d) => d).left;
    let idx = bisect(times, t);
    if (idx <= 0) idx = 0;
    else if (idx >= times.length) idx = times.length - 1;
    else if (t - times[idx - 1] < times[idx] - t) idx = idx - 1;
    this.setState({ hover: idx });
  };

  resetZoom = () => {
    this.setState({ domain: null });
  };

  render() {
    const { language, dark } = this.props;
    const { width, height, hover, fullscreen, fontSize } = this.state;
    const { times, heights, periods, directions, heightUnit, periodUnit } =
      this.series();

    const margin = this.margins();
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const ready =
      width > 0 && height > 0 && times.length > 1 && heights.length > 0;

    let x;
    let view;
    let arrowIndices = [];
    let periodIndices = [];
    if (ready) {
      ({ x, view } = this.scaleX());
      // Only sample arrows / period labels inside the visible window.
      const visible = [];
      for (let i = 0; i < times.length; i++) {
        const t = times[i].getTime();
        if (t >= view[0] && t <= view[1]) visible.push(i);
      }
      const arrowStep = Math.max(
        1,
        Math.round(visible.length / Math.max(1, Math.floor(plotWidth / 38))),
      );
      const periodStep = Math.max(
        1,
        Math.round(visible.length / Math.max(1, Math.floor(plotWidth / 64))),
      );
      for (let k = 0; k < visible.length; k += arrowStep)
        arrowIndices.push(visible[k]);
      for (let k = 0; k < visible.length; k += periodStep)
        periodIndices.push(visible[k]);
    }

    const lineColor = dark ? "#75e0f6" : "#1f6f9e";
    const lineData = this.getLineData();

    const arrowY = fontSize * 2;
    const periodValueY = fontSize * 4 + 12;
    const tickFormat = d3.timeFormat("%a %H:%M");

    return (
      <div className={fullscreen ? "vis-main full" : "vis-main"}>
        <div className="linegraph-main">
          <div
            className="wave-timeseries"
            ref={(el) => (this.wrapper = el)}
            onMouseDown={this.startPan}
            onMouseUp={this.endPan}
            onMouseLeave={() => {
              this.endPan();
              this.setState({ hover: null });
            }}
            onMouseMove={this.onMove}
            onDoubleClick={this.resetZoom}
          >
            <HeightLineGraph
              data={lineData}
              simple={true}
              xlabel=""
              xunits=""
              ylabel={Translations.significant_wave_height[language]}
              yunits={heightUnit}
              lcolor={[lineColor]}
              lweight={[2]}
              lines={true}
              scatter={false}
              curve={true}
              grid={true}
              yPadding={false}
              ymax={Math.max((d3.max(heights) || 0) * 1.1, 0.1)}
              xmin={view ? view[0] : undefined}
              xmax={view ? view[1] : undefined}
              dark={dark}
              language={language}
              fontSize={fontSize}
              marginLeft={margin.left}
              marginRight={margin.right}
              marginTop={margin.top}
              marginBottom={margin.bottom}
            />
            {ready && (
              <svg className="wave-overlay" width={width} height={height}>
                {/* direction arrows along the top */}
                {arrowIndices
                  .filter((i) => !isNaN(directions[i]))
                  .map((i) => (
                    <g
                      key={"ar" + i}
                      className="direction-arrow"
                      transform={`translate(${x(times[i])}, ${arrowY}) rotate(${this.directionAngle(
                        directions[i],
                      )})`}
                    >
                      <path d="M -7 0 L 7 0 M 4 -3 L 7 0 L 4 3" />
                    </g>
                  ))}

                {/* mean period text labels along the plot */}
                {periodIndices.map((i) => (
                  <text
                    key={"pd" + i}
                    className="period-label"
                    x={x(times[i])}
                    y={periodValueY}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {isNaN(periods[i])
                      ? ""
                      : `${Math.round(periods[i] * 10) / 10}${periodUnit}`}
                  </text>
                ))}

                {/* hover guide */}
                {hover !== null && (
                  <line
                    className="hover-line"
                    x1={x(times[hover])}
                    x2={x(times[hover])}
                    y1={margin.top}
                    y2={height - margin.bottom}
                  />
                )}
              </svg>
            )}
            {ready && hover !== null && (
              <div
                className="wave-tooltip"
                style={{
                  left: Math.min(Math.max(x(times[hover]), 70), width - 70),
                  top: margin.top + 4,
                }}
              >
                <div className="time">{tickFormat(times[hover])}</div>
                <div>
                  {Translations.significant_wave_height[language]}:{" "}
                  <b>
                    {Math.round(heights[hover] * 100) / 100} {heightUnit}
                  </b>
                </div>
                <div>
                  {Translations.mean_wave_period[language]}:{" "}
                  <b>
                    {Math.round(periods[hover] * 10) / 10} {periodUnit}
                  </b>
                </div>
                <div>
                  {Translations.wave_direction[language]}:{" "}
                  <b>{Math.round(directions[hover])}°</b>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default WaveTimeseriesGraph;
