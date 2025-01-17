import React, { Component } from "react";
import {
  downloadModelMetadata,
  download1DLinegraph,
} from "../functions/download";
import Translations from "../../../translations.json";
import SummaryTable from "../../../components/summarytable/summarytable";
import { summariseData } from "../functions/general";

class PlaceholderGraph extends Component {
  render() {
    return (
      <div>
        <div className="sketelon-graph">
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

class OneDModel extends Component {
  state = {
    selected: false,
    data: false,
  };
  async componentDidMount() {
    var { parameters } = this.props;
    var data = {};
    for (let i = 0; i < parameters.length; i++) {
      let metadata = await downloadModelMetadata(
        parameters[i].model.toLowerCase(),
        parameters[i].key
      );
      let depth = Math.min(...metadata.depth);
      let download = await download1DLinegraph(
        parameters[i].model.toLowerCase(),
        parameters[i].key,
        new Date(metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
        metadata.end_date,
        depth,
        parameters[i].parameter,
        true
      );
      let { summary, start, end } = summariseData(
        download["time"],
        download["variables"][parameters[i].parameter]["data"]
      );
      data[parameters[i].key] = {
        summary,
        start,
        end,
        dt: download["time"].map((t) => new Date(t)),
        value: download["variables"][parameters[i].parameter]["data"],
      };
    }
    this.setState({ data });
  }
  render() {
    var { language, parameters, name } = this.props;
    var { data } = this.state;
    return (
      <div className="onedmodel">
        <h3>{Translations.watertemperature[language]} - 1D</h3>
        {parameters.map((p) => (
          <div className="clickable-box" key={p.key}>
            <div className="right">{p.model}</div>
            <div className="title">{name}</div>
            {data ? (
              <SummaryTable
                start={data[p.key].start}
                end={data[p.key].end}
                dt={data[p.key].dt}
                value={data[p.key].value}
                summary={data[p.key].summary}
                unit={p.unit}
                language={language}
              />
            ) : (
              <PlaceholderGraph />
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default OneDModel;
