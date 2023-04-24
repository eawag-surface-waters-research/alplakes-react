import React, { Component } from "react";
import DatePicker from "react-datepicker";
import SimpleLine from "../../components/d3/simpleline";
import Translate from "../../translations.json";
import { formatTime, formatDateLong } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import "react-datepicker/dist/react-datepicker.css";
import "./lake.css";

class Period extends Component {
  state = {
    period: this.props.period,
    maxPeriod: 21,
  };
  setDateRange = (period) => {
    var { maxPeriod } = this.state;
    var { setPeriod } = this.props;
    if (period[0] !== null && period[1] !== null) {
      if ((period[1] - period[0]) / 86400000 > maxPeriod) {
        period = this.props.period;
        window.alert(`Please select a maximum of ${maxPeriod} days.`);
        this.setState({ period });
      } else {
        setPeriod([
          Math.floor(period[0].getTime()),
          Math.floor(period[1].getTime()),
        ]);
        this.setState({ period });
      }
    } else {
      this.setState({ period });
    }
  };
  render() {
    var { language, minDate, maxDate } = this.props;
    var { period } = this.state;
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
      <DatePicker
        selectsRange={true}
        startDate={period[0]}
        endDate={period[1]}
        onChange={(update) => {
          this.setDateRange(update);
        }}
        minDate={minDate}
        maxDate={maxDate}
        dateFormat="dd/MM/yyyy"
        locale={locale}
      />
    );
  }
}

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
    var { selection, layers, images, language, addLayer } = this.props;
    var parameters = [...new Set(layers.map((l) => l.properties.parameter))];
    if (selection === false) {
      return;
    } else if (selection === "add") {
      return (
        <div className="selection">
          <div className="title">{Translate.addlayers[language]}</div>
          {parameters.map((p) => (
            <div className="parameter" key={p}>
              <div className="header">{Translate[p][language]}</div>
              <div className="layers">
                {layers
                  .filter((l) => l.properties.parameter === p)
                  .map((l) => (
                    <div
                      className={l.active ? "layer disabled" : "layer"}
                      key={l.id}
                      onClick={() => addLayer(l.id)}
                    >
                      <div className={"icon " + l.type}>
                        <img
                          src={images[l.properties.parameter]}
                          alt={l.properties.parameter}
                        />
                      </div>
                      <div className="text">
                        3D Lake Model
                        <div className="type">delft3d-flow</div>
                      </div>
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
          <div className="title">{Translate.settings[language]}</div>
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
      depth,
      depths,
      simpleline,
      dark,
      period,
      layers,
      removeLayer,
      selection,
      setDepth,
      setSelection,
      setPeriod,
      addLayer,
      minDate,
      maxDate,
    } = this.props;
    var { images } = this.state;
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
                {formatDateLong(datetime, Translate.axis[language].months)}
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
          <select value={depth} onChange={setDepth}>
            {depths.map((d) => (
              <option value={d} key={d}>
                {d + " m"}
              </option>
            ))}
          </select>
          <Period
            period={period}
            setPeriod={setPeriod}
            language={language}
            minDate={minDate}
            maxDate={maxDate}
          />
          <div className="labels">
            <div className="depth">{Translate.depth[language]}</div>
            <div className="start">{Translate.start[language]}</div>
            <div className="end">{Translate.end[language]}</div>
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
          language={language}
          addLayer={addLayer}
        />
      </React.Fragment>
    );
  }
}

export default Sidebar;
