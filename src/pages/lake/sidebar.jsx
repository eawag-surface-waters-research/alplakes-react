import React, { Component } from "react";
import SimpleLine from "../../components/d3/simpleline";
import Translate from "../../translations.json";
import { formatTime, formatDateLong, formatDate } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import "./lake.css";

class ActiveApps extends Component {
  state = {};
  test = () => {
    console.log("Firing");
  };
  removeLayer = (event) => {
    event.stopPropagation();
    var { removeLayer } = this.props;
    removeLayer(parseInt(event.target.getAttribute("id")));
  };
  render() {
    var { language, layers, setSelection } = this.props;
    var extra = Math.max(1, 4 - layers.filter((l) => l.active).length);
    var images = { temperature: temperature_icon, velocity: velocity_icon };
    return (
      <React.Fragment>
        <div className="loaded">
          {layers
            .filter((l) => l.active)
            .map((layer) => (
              <div
                className={"app filled " + layer.type}
                key={layer.id}
                onClick={() => setSelection(layer.id)}
              >
                <div
                  className="remove"
                  title="Remove layer"
                  id={layer.id}
                  onClick={this.removeLayer}
                >
                  -
                </div>
                <img
                  src={images[layer.properties.parameter]}
                  alt="layer.properites.parameter"
                />
                <span>
                  {Translate[layer.properties.parameter][language]}
                  <div className="type">{layer.properties.model}</div>
                </span>
              </div>
            ))}
          {[...Array(extra).keys()].map((p) => (
            <div className="app" title="Add layer" key={p} onClick={() => setSelection("add")}>
              +
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class Selection extends Component {
  render() {
    var { selection, layers, setSelection } = this.props;
    if (selection === false) {
      return;
    } else if (selection === "add") {
      return <div className="selection">Add new layer</div>;
    } else if (Number.isInteger(selection)) {
      return <div className="selection">Edit layer parameters</div>;
    }
  }
}

class Sidebar extends Component {
  state = {};
  render() {
    var {
      metadata,
      language,
      temperature,
      average,
      datetime,
      simpleline,
      dark,
      period,
      layers,
      removeLayer,
      selection,
      setSelection,
    } = this.props;
    return (
      <React.Fragment>
        <div className="info">
          <div className="data">
            <div className="temperature">
              <div className="value" id="temperature_value">
                {temperature.toFixed(1)}
              </div>
              <div className="details">
                <div className="unit">°C</div>
                <div className="average">{average && "AVE"}</div>
              </div>
            </div>
            <div className="datetime">
              <div className="date" id="date_value">
                {formatDateLong(datetime, Translate.month[language])}
              </div>
              <div className="time" id="time_value">
                {formatTime(datetime)}
              </div>
            </div>
          </div>
          <div className="graph">
            <SimpleLine
              simpleline={simpleline}
              datetime={datetime}
              temperature={temperature}
              formatDate={formatDateLong}
              formatTime={formatTime}
              language={language}
              dark={dark}
            />
            <div className="graph-parameter">
              {Translate.watertemperature[language]}
            </div>
          </div>
        </div>
        <div className="depth-period">
          
        </div>
        <div className="menu">
          <ActiveApps
            layers={layers}
            language={language}
            removeLayer={removeLayer}
            setSelection={setSelection}
          />
        </div>
        <Selection
          selection={selection}
          setSelection={setSelection}
          layers={layers}
        />
      </React.Fragment>
    );
  }
}

export default Sidebar;
