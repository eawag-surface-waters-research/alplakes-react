import React, { Component } from "react";
import Translate from "../../translations.json";

const formatDateTime = (datetime, months) => {
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

class ModuleLabels extends Component {
  render() {
    var { module, layers, selection, language } = this.props;
    var labels = [];
    if ("labels" in module) {
      labels = JSON.parse(JSON.stringify(module.labels));
      var layer = layers.find((l) => l.id === selection);
      var months = Translate.axis[language].months;
      for (let key of Object.keys(labels)) {
        if (labels[key] === "satelliteAverage") {
          if (layer && "image" in layer.displayOptions) {
            labels[key] =
              Math.round(layer.displayOptions.image.ave * 10) / 10 +
              " " +
              layer.unit;
          } else {
            labels[key] = "";
          }
        } else if (labels[key] === "satelliteDatetime") {
          if (layer && "image" in layer.displayOptions) {
            labels[key] = formatDateTime(
              layer.displayOptions.image.time,
              months
            );
          } else {
            labels[key] = "";
          }
        } else if (labels[key] === "forecast5") {
          labels[key] = Translate["forecast5"][language];
        } else if (labels[key] === "simstratDatetime") {
          if (layer && "labels" in layer.displayOptions) {
            labels[key] = formatDateTime(
              layer.displayOptions.labels.time,
              months
            );
          } else {
            labels[key] = "";
          }
        } else if (labels[key] === "simstratAverage") {
          if (layer && "labels" in layer.displayOptions) {
            labels[key] =
              Math.round(layer.displayOptions.labels.value * 10) / 10 +
              " " +
              layer.unit;
          } else {
            labels[key] = "";
          }
        }
      }
    }

    return (
      <div className="labels">
        {Object.keys(labels).map((l) => (
          <div className={l} key={l}>
            {labels[l]}
          </div>
        ))}
      </div>
    );
  }
}

export default ModuleLabels;
