import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import { downloadModelMetadata, download3DMap } from "../functions/download";
import {
  formatReadableDate,
  formatTime,
  processLabels,
} from "../functions/general";
import SummaryTable from "../../../components/summarytable/summarytable";

class PlaceholderGraph extends Component {
  render() {
    var { title, model } = this.props;
    return (
      <div className="clickable-box">
        <div className="title">{title}</div>
        <div className="right">{model}</div>
        <div className="skeleton-box">
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border right" />
        </div>
        <div className="skeleton-data" />
      </div>
    );
  }
}

class ThreeDModel extends Component {
  state = {
    updates: [],
    metadata: {},
    data: {},
    datetime: false,
    labels: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  setDatetime = (datetime) => {
    this.setState({ datetime });
  };

  async componentDidMount() {
    var { parameters } = this.props;
    var { updates } = this.state;
    let metadata = await downloadModelMetadata(
      parameters.model.toLowerCase(),
      parameters.key
    );
    const data = await download3DMap(
      parameters.model.toLowerCase(),
      parameters.key,
      new Date(metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
      metadata.end_date,
      0,
      ["geometry", "temperature", "velocity"],
      metadata.height,
      true
    );
    const now = new Date();
    var index = data.temperature.data.length - 1;
    var datetime = data.temperature.end;
    const timestep =
      (data.temperature.end - data.temperature.start) /
      (data.temperature.data.length - 1);
    if (data.temperature.end > now) {
      index = Math.ceil((now - data.temperature.start) / timestep);
      datetime = new Date(data.temperature.start.getTime() + index * timestep);
    }
    const labels = processLabels(
      parameters.labels,
      data.geometry,
      data.temperature,
      parameters.key
    );
    updates.push({
      event: "addLayer",
      type: "addRaster",
      id: "raster_temperature",
      options: {
        data: data.temperature.data[index],
        geometry: data.geometry,
        labels,
        displayOptions: {
          min: data.temperature.min,
          max: data.temperature.max,
          unit: "°C",
        },
      },
    });
    updates.push({
      event: "addLayer",
      type: "addVectorField",
      id: "vector_currents",
      options: {
        data: data.velocity.data[index],
        geometry: data.geometry,
        displayOptions: {
          min: data.velocity.min,
          max: data.velocity.max,
          unit: "m/s",
        },
      },
    });
    updates.push({
      event: "addPlay",
      options: {
        data: {
          raster_temperature: data.temperature.data,
          vector_currents: data.velocity.data,
        },
        period: [
          data.temperature.start.getTime(),
          data.temperature.end.getTime(),
        ],
        datetime: datetime.getTime(),
        timestep: 1800000,
      },
    });
    this.setState({
      metadata,
      data,
      updates,
      datetime,
      labels,
    });
  }
  render() {
    var { updates, mapId, datetime, labels } = this.state;
    var { dark, bounds, language, id, parameters } = this.props;
    return (
      <div className="threedmodel">
        <h3>
          {Translations.temperaturecurrent[language]} - 3D{" "}
          <Information information={Translations.threedmodelText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {datetime && (
              <div className="current">
                <div>{formatReadableDate(datetime, language)}</div>
                <div>{formatTime(datetime)}</div>
              </div>
            )}
            <MapButton
              link={`/map/${id}?layers=water_temperature`}
              language={language}
            />
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
          <div className="map-sidebar-right">
            {labels
              ? labels.map((l) => (
                  <NavLink to={l.url} key={l.name}>
                    <div className="clickable-box">
                      <div className="right">{parameters.model}</div>
                      <div className="title">{l.name}</div>
                      <SummaryTable
                        start={l.start}
                        end={l.end}
                        dt={l.time}
                        value={l.values}
                        summary={l.summary}
                        unit={"°"}
                        language={language}
                      />
                    </div>
                  </NavLink>
                ))
              : parameters.labels.map((l) => (
                  <PlaceholderGraph
                    key={l.name}
                    title={l.name}
                    model={parameters.model}
                  />
                ))}
          </div>
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
