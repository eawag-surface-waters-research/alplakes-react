import React, { Component } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import { download2DMetadata, download2DMap } from "../functions/download";
import { formatReadableDate, formatTime } from "../functions/general";
import warningIcon from "../../../img/warning.png";
import ModelPerformanceButton from "../../../components/modelperformance/modelperformancebutton";

// Absolute ceiling (m) used to scale the slider waveform, so a calm period
// reads as a flat ribbon and a storm fills the height rather than each window
// being normalised to its own max.
const WAVE_HEIGHT_FULL_SCALE = 1;

// Number of bins for the small spatial wave-height distribution plot.
const WAVE_HIST_BINS = 12;

// Tiny bar plot of how the lake's cells are distributed across wave heights at
// the current timestep: mass on the left = only a small area is rough, mass
// shifting right = large waves over more of the lake.
class WaveDistribution extends Component {
  state = { hover: null };

  render() {
    const { counts, min, max } = this.props;
    if (!counts) return null;
    const maxCount = Math.max(...counts);
    if (!(maxCount > 0)) return null;
    const total = counts.reduce((a, b) => a + b, 0);
    const n = counts.length;
    const slot = 100 / n;
    const gap = 0.18;
    const { hover } = this.state;
    const binLow = hover !== null ? min + (hover / n) * (max - min) : 0;
    const binHigh = hover !== null ? min + ((hover + 1) / n) * (max - min) : 0;
    return (
      <div className="wave-distribution">
        {hover !== null && (
          <div
            className="wave-distribution-tooltip"
            style={{ left: `${(hover + 0.5) * slot}%` }}
          >
            {Math.round((counts[hover] / total) * 100)}%
            <span className="height">
              {Math.round(binLow * 100) / 100}&ndash;
              {Math.round(binHigh * 100) / 100} m
            </span>
          </div>
        )}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          {counts.map((c, i) => {
            const h = (c / maxCount) * 100;
            return (
              <rect
                key={i}
                x={i * slot + (slot * gap) / 2}
                y={100 - h}
                width={slot * (1 - gap)}
                height={h}
              />
            );
          })}
          {counts.map((c, i) => (
            <rect
              key={"hit" + i}
              className="hit"
              x={i * slot}
              y={0}
              width={slot}
              height={100}
              onMouseEnter={() => this.setState({ hover: i })}
              onMouseLeave={() => this.setState({ hover: null })}
            />
          ))}
        </svg>
      </div>
    );
  }
}

class TwoDModel extends Component {
  state = {
    updates: [],
    metadata: {},
    data: {},
    datetime: false,
    warning: false,
    waveHeightRange: [],
    waveHeightHist: [],
    period: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  gridRange = (grid) => {
    var min = Infinity;
    var max = -Infinity;
    var sum = 0;
    var count = 0;
    for (let row of grid) {
      for (let value of row) {
        if (!isNaN(value)) {
          if (value < min) min = value;
          if (value > max) max = value;
          sum += value;
          count++;
        }
      }
    }
    return min === Infinity ? false : { min, max, mean: sum / count };
  };

  // Bin a grid's cells into [min, max] across WAVE_HIST_BINS bins, so the
  // distribution spans exactly the range shown on the axis: mass on the left =
  // only a small area reaches the higher end, mass on the right = most of the
  // lake is near the maximum.
  gridHistogram = (grid, min, max) => {
    const counts = new Array(WAVE_HIST_BINS).fill(0);
    const span = max - min;
    if (!(span > 0)) return counts;
    for (let row of grid) {
      for (let value of row) {
        if (!isNaN(value)) {
          let b = Math.floor(((value - min) / span) * WAVE_HIST_BINS);
          if (b >= WAVE_HIST_BINS) b = WAVE_HIST_BINS - 1;
          if (b < 0) b = 0;
          counts[b]++;
        }
      }
    }
    return counts;
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  setDatetime = (datetime) => {
    this.setState({ datetime });
  };

  closeWarning = () => {
    this.setState({ warning: false });
  };

  async componentDidMount() {
    var { parameters } = this.props;
    var { updates, warning } = this.state;
    let metadata = await download2DMetadata(
      parameters.model.toLowerCase(),
      parameters.key,
    );
    if ("warning" in metadata) {
      warning = metadata.warning;
    }
    const data = await download2DMap(
      parameters.model.toLowerCase(),
      parameters.key,
      new Date(metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
      metadata.end_date,
      ["geometry", "significant_wave_height", "wave_direction"],
      metadata.height,
      true,
    );
    const reference = data.significant_wave_height;
    const now = new Date();
    const timestep =
      (reference.end - reference.start) / (reference.data.length - 1);
    var index = reference.data.length - 1;
    if (reference.end > now) {
      index = Math.min(
        reference.data.length - 1,
        Math.max(0, Math.round((now - reference.start) / timestep)),
      );
    } else {
      warning = {
        EN: "Model offline, historical data can still be accessed.",
        DE: "Modell offline, auf historische Daten kann weiterhin zugegriffen werden.",
        FR: "Modèle hors ligne, les données historiques sont toujours accessibles.",
        IT: "Modello offline, i dati storici sono comunque accessibili.",
      };
    }
    const datetime = new Date(reference.start.getTime() + index * timestep);
    const waveHeightRange = reference.data.map((grid) => this.gridRange(grid));
    const sparkline = {
      max: waveHeightRange.map((r) => (r ? r.max : 0)),
      mean: waveHeightRange.map((r) => (r ? r.mean : 0)),
      scaleMax: WAVE_HEIGHT_FULL_SCALE,
    };
    updates.push({
      event: "addLayer",
      type: "raster",
      id: "2D_significant_wave_height",
      options: {
        data: reference.data[index],
        geometry: data.geometry,
        displayOptions: {
          min: 0,
          max: Math.max(0.7, reference.max),
          unit: "m",
          paletteName: "Surfline",
        },
      },
    });
    updates.push({
      event: "addLayer",
      type: "direction",
      id: "2D_wave_direction",
      options: {
        data: data.wave_direction.data[index],
        geometry: data.geometry,
        displayOptions: {
          direction: true,
          arrowsColor: "#000000",
          opacity: 0.8,
          zIndex: 3,
          unit: "°",
        },
      },
    });
    updates.push({
      event: "addPlay",
      options: {
        data: {
          "2D_significant_wave_height": reference.data,
          "2D_wave_direction": data.wave_direction.data,
        },
        period: [reference.start.getTime(), reference.end.getTime()],
        datetime: datetime.getTime(),
        timestep,
        sparkline,
      },
    });
    const waveHeightHist = reference.data.map((grid, i) => {
      const r = waveHeightRange[i];
      return r
        ? this.gridHistogram(grid, r.min, r.max)
        : new Array(WAVE_HIST_BINS).fill(0);
    });
    this.setState({
      metadata,
      data,
      updates,
      datetime,
      warning,
      waveHeightRange,
      waveHeightHist,
      period: [reference.start.getTime(), reference.end.getTime()],
    });
  }

  currentIndex = () => {
    var { datetime, waveHeightRange, period } = this.state;
    if (!datetime || !period || waveHeightRange.length === 0) return -1;
    const dt = new Date(datetime).getTime();
    const timestep = (period[1] - period[0]) / waveHeightRange.length;
    return Math.max(
      Math.min(
        Math.floor((dt - period[0]) / timestep),
        waveHeightRange.length - 1,
      ),
      0,
    );
  };

  currentRange = () => {
    const index = this.currentIndex();
    return index < 0 ? false : this.state.waveHeightRange[index];
  };

  currentHist = () => {
    const index = this.currentIndex();
    return index < 0 ? false : this.state.waveHeightHist[index];
  };

  render() {
    var { updates, mapId, datetime, warning, metadata } = this.state;
    var { dark, bounds, language, id, parameters, togglePerformance } =
      this.props;
    var range = this.currentRange();
    var hist = this.currentHist();
    return (
      <div className="twodmodel subsection">
        <h3>
          {Translations.waves[language]} - 2D{" "}
          <Information information={Translations.twodmodelText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            <div className="forecast-boxes">
              {datetime && (
                <div className="current">
                  <div>{formatReadableDate(datetime, language)}</div>
                  <div>{formatTime(datetime)}</div>
                </div>
              )}
              {range && (
                <div className="wave-range">
                  <div className="summary">
                    <span className="label">
                      {Translations.max_wave_height[language]}
                    </span>
                    <span className="value">
                      {Math.round(range.max * 100) / 100} m
                    </span>
                  </div>
                  {hist && range.max >= 0.05 && (
                    <WaveDistribution
                      counts={hist}
                      min={range.min}
                      max={range.max}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="model-source">
              <b>{parameters.model.toUpperCase()}</b>{" "}
              {Translations.developedAt[language]}{" "}
              <a
                href="https://www.eawag.ch"
                alt="Eawag"
                target="_blank"
                rel="noopener noreferrer"
              >
                Eawag
              </a>
            </div>
            <MapButton
              link={`/map/${id}?layers=2D_significant_wave_height,2D_wave_direction`}
              language={language}
            />
            {metadata.rmse && (
              <ModelPerformanceButton
                rmse={metadata.rmse}
                language={language}
                open={togglePerformance}
              />
            )}
            <div className="popup">
              {warning && (
                <div className="warning-popup" onClick={this.closeWarning}>
                  <img src={warningIcon} alt="Warning" />
                  <div className="warning-popup-inner">{warning[language]}</div>
                  <div className="close">&#10005;</div>
                </div>
              )}
            </div>
            <Basemap
              updates={updates}
              updated={this.updated}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
              load={true}
              language={language}
              setDatetime={this.setDatetime}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TwoDModel;
