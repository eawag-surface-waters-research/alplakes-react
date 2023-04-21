import React, { Component } from "react";
import DatePicker from "react-datepicker";
import SimpleLine from "../../components/d3/simpleline";
import Translate from "../../translations.json";
import { formatTime, formatDateLong } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import "react-datepicker/dist/react-datepicker.css";
import "./lake.css";

class ActiveApps extends Component {
  state = {};
  removeLayer = (event) => {
    event.stopPropagation();
    var { removeLayer } = this.props;
    removeLayer(parseInt(event.target.getAttribute("id")));
  };
  render() {
    var { language, layers, setSelection, selection, images } = this.props;
    var extra = Math.max(1, 4 - layers.filter((l) => l.active).length);

    return (
      <React.Fragment>
        <div className="loaded">
          {layers
            .filter((l) => l.active)
            .map((layer) => (
              <div
                className={
                  "app filled " +
                  layer.type +
                  (selection === layer.id ? " active" : "")
                }
                key={layer.id}
                onClick={() => setSelection(layer.id)}
                title="Edit settings"
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
                  alt={layer.properties.parameter}
                />
                <span>
                  {Translate[layer.properties.parameter][language]}
                  <div className="type">{layer.properties.model}</div>
                </span>
              </div>
            ))}
          {[...Array(extra).keys()].map((p) => (
            <div
              className="app"
              title="Add layer"
              key={p}
              onClick={() => setSelection("add")}
            >
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
    var { selection, layers, images } = this.props;
    var parameters = [...new Set(layers.map((l) => l.properties.parameter))];
    if (selection === false) {
      return;
    } else if (selection === "add") {
      return (
        <div className="selection">
          <div className="title">Add layers</div>
          {parameters.map((p) => (
            <div className="parameter" key={p}>
              <div className="header">{p}</div>
              <div className="layers">
                {layers
                  .filter((l) => l.properties.parameter === p)
                  .map((l) => (
                    <div className="layer" key={l.id}>
                      <div className={"icon " + l.type}>
                        <img
                          src={images[l.properties.parameter]}
                          alt={l.properties.parameter}
                        />
                      </div>
                      Delft3D Hydrodynamic Simulation using MeteoSwiss COSMO data.
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (Number.isInteger(selection)) {
      return (
        <div className="selection">
          <div className="title">Layer settings</div>
        </div>
      );
    }
  }
}

class Sidebar extends Component {
  state = {
    images: { temperature: temperature_icon, velocity: velocity_icon },
  };
  setDateRange = (event) => {
    console.log(event);
  };
  render() {
    var {
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
    var { images } = this.state;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };

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
          <select title="Set depth">
            <option>0.6m</option>
          </select>
          <DatePicker
            selectsRange={true}
            startDate={period[0]}
            endDate={period[1]}
            onChange={(update) => {
              this.setDateRange(update);
            }}
            dateFormat="dd/MM/yyyy"
            locale={locale}
          />
          <div className="labels">
            <div className="depth">Depth</div>
            <div className="start">Start</div>
            <div className="end">End</div>
          </div>
        </div>
        <div className="menu">
          <ActiveApps
            layers={layers}
            selection={selection}
            language={language}
            removeLayer={removeLayer}
            setSelection={setSelection}
            images={images}
          />
        </div>
        <Selection
          selection={selection}
          setSelection={setSelection}
          layers={layers}
          images={images}
        />
      </React.Fragment>
    );
  }
}

export default Sidebar;
