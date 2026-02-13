import React, { Component } from "react";
import Translations from "../../translations.json";
import Color from "../../components/customselect/color";
import "./satellitetimeseriesmodal.css";

class SatelliteTimeseriesModal extends Component {
  state = {
    parameter: "",
    satellite: "",
    parameters: [],
    satellites: [],
    options: {},
    lat: 0,
    lng: 0,
    pixels: 10,
    window_radius: 0,
    statistic: "mean",
    name: "",
    color: "#dd164bc4",
    markerID: false,
    location: "custom",
  };

  updateParameter = (event) => {
    const { options } = this.state;
    const parameter = event.target.value;
    var satellites = Object.keys(options[parameter]);
    var satellite = satellites[0];
    this.setState({
      parameter,
      satellites,
      satellite,
      location: "custom",
    });
  };

  updateSatellite = (event) => {
    this.setState({ satellite: event.target.value });
  };

  updateLat = (event) => {
    this.setState({ lat: event.target.value });
  };

  updateLng = (event) => {
    this.setState({ lng: event.target.value });
  };

  updatePixels = (event) => {
    this.setState({ pixels: event.target.value });
  };

  updateWindowRadius = (event) => {
    this.setState({ window_radius: event.target.value });
  };

  updateStatistic = (event) => {
    this.setState({ statistic: event.target.value });
  };

  updateColor = (event) => {
    this.setState({ color: event.target.value });
  };

  updateName = (event) => {
    this.setState({ name: event.target.value });
  };

  sendResult = () => {
    const { downloadSatelliteTimeseries, closeSatelliteTimeseriesModel } =
      this.props;
    const {
      parameter,
      satellite,
      options,
      lat,
      lng,
      window_radius,
      pixels,
      statistic,
      name,
      color,
      markerID,
    } = this.state;
    closeSatelliteTimeseriesModel(false);
    downloadSatelliteTimeseries(
      options[parameter][satellite]["layer_id"],
      satellite.toLowerCase(),
      options[parameter][satellite]["parameter"],
      lat,
      lng,
      window_radius,
      pixels,
      statistic,
      name,
      color,
      markerID,
    );
  };

  updateLocation = (event) => {
    var { lat, lng, options, parameter, satellite } = this.state;
    const location = event.target.value;
    if (location === "insitu") {
      let reference = options[parameter][satellite].reference;
      lat = reference.latitude;
      lng = reference.longitude;
    }
    this.setState({ lat, lng, location });
  };

  componentDidMount() {
    var { layers, properties, satelliteTimeseriesCount } = this.props;
    var parameters = [];
    var options = {};
    for (let layer of layers) {
      if (layer.active && layer.type === "satellite") {
        parameters.push(layer["parameter"]);
        options[layer["parameter"]] = {};
        let reference = false;
        if (layer.graph.satellite_timeseries.reference) {
          reference = {
            latitude: layer.graph.satellite_timeseries.reference.latitude,
            longitude: layer.graph.satellite_timeseries.reference.longitude,
          };
        }
        for (let satellite of layer["sources"]["sencast"]["models"]) {
          options[layer["parameter"]][satellite["model"]] = {
            parameter: satellite["metadata"]
              .split("/")
              .pop()
              .replace(".json", ""),
            layer_id: layer.id,
            reference,
          };
        }
      }
    }
    const name = "Series " + satelliteTimeseriesCount;
    var parameter = parameters[0];
    var satellites = Object.keys(options[parameter]);
    var satellite = satellites[0];
    this.setState({
      parameter,
      satellite,
      parameters,
      satellites,
      options,
      lat: Math.round(properties.lat * 10000) / 10000,
      lng: Math.round(properties.lng * 10000) / 10000,
      name,
      markerID: properties.id,
    });
  }

  render() {
    const {
      parameter,
      satellite,
      parameters,
      satellites,
      lat,
      lng,
      pixels,
      window_radius,
      statistic,
      color,
      name,
      markerID,
      options,
      location,
    } = this.state;
    const { language, closeSatelliteTimeseriesModel } = this.props;
    var reference = false;
    if (parameter in options) {
      reference = options[parameter][satellite].reference;
    }
    return (
      <div className="satellite-timeseries-modal">
        <div className="title-modal">
          {Translations.satelliteTimeseries[language]}
        </div>
        <div
          className="close-modal"
          onClick={() => closeSatelliteTimeseriesModel(markerID)}
        >
          &#10005;
        </div>

        <div className="settings-modal">
          <div className="setting half">
            <div className="label">{Translations.parameter[language]}</div>
            <select value={parameter} onChange={this.updateParameter}>
              {parameters.map((p) => (
                <option value={p} key={p}>
                  {Translations[p][language]}
                </option>
              ))}
            </select>
          </div>

          <div className="setting half">
            <div className="label">{Translations.satellite[language]}</div>
            <select value={satellite} onChange={this.updateSatellite}>
              {satellites.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="setting">
            <div className="label">{Translations.location[language]}</div>
            {reference ? (
              <div className="value highlight">
                {Translations.presetsAvailable[language]}
              </div>
            ) : (
              <div className="value red">
                {Translations.presetsNotAvailable[language]}
              </div>
            )}

            <select
              value={location}
              onChange={this.updateLocation}
              className="wide"
              disabled={reference === false}
            >
              <option value="custom" selected>
                {Translations.customCoordinates[language]}
              </option>
              <option value="" disabled>
                ──────────
              </option>
              {reference && (
                <option value="insitu">
                  Insitu [{reference.latitude}, {reference.longitude}]
                </option>
              )}
            </select>
          </div>

          <div className="setting half">
            <div className="label">Latitude</div>
            <div className="minmax">
              <input type="number" value={lat} onChange={this.updateLat} />
            </div>
          </div>

          <div className="setting half">
            <div className="label">Longitude</div>
            <div className="minmax">
              <input type="number" value={lng} onChange={this.updateLng} />
            </div>
          </div>

          <div className="setting half">
            <div className="label">
              {Translations.extractionWindow[language]}
            </div>
            <select value={window_radius} onChange={this.updateWindowRadius}>
              <option value={0}>1x1</option>
              <option value={1}>3x3</option>
              <option value={2}>5x5</option>
              <option value={3}>7x7</option>
            </select>
          </div>

          <div className="setting half">
            <div className="label">{Translations.validPixels[language]}</div>
            <div className="minmax">
              <input
                type="number"
                value={pixels}
                onChange={this.updatePixels}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div className="setting half">
            <div className="label">{Translations.statistic[language]}</div>
            <select value={statistic} onChange={this.updateStatistic}>
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>
          </div>

          <div className="setting half">
            <div className="label">{Translations.color[language]}</div>
            <Color value={color} onChange={this.updateColor} />
          </div>

          <div className="setting">
            <div className="label">{Translations.name[language]}</div>
            <input type="text" value={name} onChange={this.updateName} />
          </div>
        </div>

        <div className="modal-warning">
          ⚠️ {Translations.extractionWarning[language]}
        </div>

        <div className="confirm" onClick={this.sendResult}>
          {Translations.confirm[language]}
        </div>
      </div>
    );
  }
}

export default SatelliteTimeseriesModal;
