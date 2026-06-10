import React, { Component } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import { download2DMetadata, download2DMap } from "../functions/download";
import { formatReadableDate, formatTime } from "../functions/general";
import warningIcon from "../../../img/warning.png";
import ModelPerformanceButton from "../../../components/modelperformance/modelperformancebutton";

class TwoDModel extends Component {
  state = {
    updates: [],
    metadata: {},
    data: {},
    datetime: false,
    warning: false,
    waveHeightRange: [],
    period: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  gridRange = (grid) => {
    var min = Infinity;
    var max = -Infinity;
    for (let row of grid) {
      for (let value of row) {
        if (!isNaN(value)) {
          if (value < min) min = value;
          if (value > max) max = value;
        }
      }
    }
    return min === Infinity ? false : { min, max };
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
    updates.push({
      event: "addLayer",
      type: "raster",
      id: "2D_significant_wave_height",
      options: {
        data: reference.data[index],
        geometry: data.geometry,
        displayOptions: {
          min: reference.min,
          max: reference.max,
          unit: "m",
          paletteName: "Thermal",
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
      },
    });
    this.setState({
      metadata,
      data,
      updates,
      datetime,
      warning,
      waveHeightRange: reference.data.map((grid) => this.gridRange(grid)),
      period: [reference.start.getTime(), reference.end.getTime()],
    });
  }

  currentRange = () => {
    var { datetime, waveHeightRange, period } = this.state;
    if (!datetime || !period || waveHeightRange.length === 0) return false;
    const dt = new Date(datetime).getTime();
    const timestep = (period[1] - period[0]) / waveHeightRange.length;
    const index = Math.max(
      Math.min(
        Math.floor((dt - period[0]) / timestep),
        waveHeightRange.length - 1,
      ),
      0,
    );
    return waveHeightRange[index];
  };

  render() {
    var { updates, mapId, datetime, warning, metadata } = this.state;
    var { dark, bounds, language, id, parameters, togglePerformance } =
      this.props;
    var range = this.currentRange();
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
                  <div className="label">
                    {Translations.significant_wave_height[language]}
                  </div>
                  <div className="value">
                    {Math.round(range.min * 100) / 100} &ndash;{" "}
                    {Math.round(range.max * 100) / 100} m
                  </div>
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
