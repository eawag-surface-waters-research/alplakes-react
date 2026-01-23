import React, { Component } from "react";
import Translations from "../../translations.json";
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
    } = this.state;
    closeSatelliteTimeseriesModel();
    downloadSatelliteTimeseries(
      options[parameter][satellite]["layer_id"],
      satellite.toLowerCase(),
      options[parameter][satellite]["parameter"],
      lat,
      lng,
      window_radius,
      pixels,
      statistic,
    );
  };

  componentDidMount() {
    var { layers, latlng } = this.props;
    var parameters = [];
    var options = {};
    for (let layer of layers) {
      if (layer.active) {
        parameters.push(layer["parameter"]);
        options[layer["parameter"]] = {};
        for (let satellite of layer["sources"]["sencast"]["models"]) {
          options[layer["parameter"]][satellite["model"]] = {
            parameter: satellite["metadata"]
              .split("/")
              .pop()
              .replace(".json", ""),
            layer_id: layer.id,
          };
        }
      }
    }
    var parameter = parameters[0];
    var satellites = Object.keys(options[parameter]);
    var satellite = satellites[0];
    this.setState({
      parameter,
      satellite,
      parameters,
      satellites,
      options,
      lat: Math.round(latlng.lat * 10000) / 10000,
      lng: Math.round(latlng.lng * 10000) / 10000,
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
    } = this.state;
    const { language, closeSatelliteTimeseriesModel } = this.props;
    return (
      <div className="satellite-timeseries-modal">
        <div className="title-modal">Satellite Timeseries</div>
        <div className="close-modal" onClick={closeSatelliteTimeseriesModel}>
          &#10005;
        </div>

        <div className="settings-modal">
          <div className="setting half">
            <div className="label">Parameter</div>
            <select value={parameter} onChange={this.updateParameter}>
              {parameters.map((p) => (
                <option value={p} key={p}>
                  {Translations[p][language]}
                </option>
              ))}
            </select>
          </div>

          <div className="setting half">
            <div className="label">Satellite</div>
            <select value={satellite} onChange={this.updateSatellite}>
              {satellites.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
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
            <div className="label">Extraction window</div>
            <select value={window_radius} onChange={this.updateWindowRadius}>
              <option value={0}>1x1</option>
              <option value={1}>3x3</option>
              <option value={2}>5x5</option>
              <option value={3}>7x7</option>
            </select>
          </div>

          <div className="setting half">
            <div className="label">Valid Pixels</div>
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
            <div className="label">Statistic</div>
            <select value={statistic} onChange={this.updateStatistic}>
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>
          </div>
        </div>

        <div className="modal-warning">
          ⚠️ Extracting the time series may take several minutes.
        </div>

        <div className="confirm" onClick={this.sendResult}>
          Confirm
        </div>
      </div>
    );
  }
}

export default SatelliteTimeseriesModal;
