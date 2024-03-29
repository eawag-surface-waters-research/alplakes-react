import React, { Component } from "react";
import DatePicker from "react-datepicker";
import SimpleLine from "../../components/d3/simpleline/simpleline";
import LayerSettings from "./layersettings";
import Translate from "../../translations.json";
import { formatTime, formatDateLong, parseDay } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import chla_icon from "../../img/chla.png";
import transect_icon from "../../img/transect.png";
import profile_icon from "../../img/profile.png";
import secchi_icon from "../../img/secchi.png";
import turbidity_icon from "../../img/turbidity.png";
import rgb_icon from "../../img/rgb.png";
import particles_icon from "../../img/particles.png";
import thermocline_icon from "../../img/thermocline.png";
import "react-datepicker/dist/react-datepicker.css";
import "./lake.css";

class ShowMoreText extends Component {
  state = {
    showFullText: false,
  };

  toggleText = () => {
    this.setState({
      showFullText: !this.state.showFullText,
    });
  };

  render() {
    const { text, links, maxLength } = this.props;
    const { showFullText } = this.state;

    const truncatedText =
      text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    var show = showFullText ? text : truncatedText;

    return (
      <div onClick={this.toggleText}>
        <p>
          {show.split("@").map((t) =>
            t in links ? (
              <a
                href={links[t][1]}
                target="_blank"
                rel="noopener noreferrer"
                key={t}
              >
                {links[t][0]}
              </a>
            ) : (
              t
            )
          )}
        </p>
        {text.length > maxLength && (
          <button>{showFullText ? "Show less" : "Show more"}</button>
        )}
      </div>
    );
  }
}

class Period extends Component {
  state = {
    period: this.props.period,
    maxPeriod: 21,
    maxPeriodDate: false,
  };
  addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  setDateRange = (period) => {
    var { maxPeriod } = this.state;
    var { setPeriod, maxDate } = this.props;
    if (period[0] !== null && period[1] !== null) {
      setPeriod([
        Math.floor(period[0].getTime()),
        Math.floor(period[1].getTime() + 86400000),
      ]);
      this.setState({ period, maxPeriodDate: false });
    } else if (period[0] !== null && period[1] === null) {
      var maxPeriodDate = this.addDays(period[0], maxPeriod);
      this.setState({
        period,
        maxPeriodDate: maxPeriodDate < maxDate ? maxPeriodDate : maxDate,
      });
    }
  };
  render() {
    var { language, minDate, maxDate, missingDates } = this.props;
    var { period, maxPeriodDate } = this.state;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    var excludeDateIntervals = missingDates.map((m) => {
      return {
        start: parseDay(m[0].replaceAll("-", "")),
        end: parseDay(m[1].replaceAll("-", "")),
      };
    });
    return (
      <DatePicker
        selectsRange={true}
        startDate={period[0]}
        endDate={period[1]}
        onChange={(update) => {
          this.setDateRange(update);
        }}
        excludeDateIntervals={excludeDateIntervals}
        minDate={minDate}
        maxDate={maxPeriodDate ? maxPeriodDate : maxDate}
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
  handleDragStart = (event, index) => {
    event.dataTransfer.setData("text/plain", index);
    event.dataTransfer.dropEffect = "move";
  };
  handleDragOver = (event) => {
    event.preventDefault();
  };
  handleDrop = (event, index) => {
    console.log(event.dataTransfer);
    const droppedIndex = event.dataTransfer.getData("text/plain");
    console.log(droppedIndex);
  };
  render() {
    var { language, layers, setSelection, selection, images } = this.props;
    var extra = Math.max(1, 4 - layers.filter((l) => l.active).length);

    return (
      <React.Fragment>
        <div className="loaded">
          {layers
            .filter((l) => l.active)
            .sort((a, b) =>
              a.properties.options["zIndex"] > b.properties.options["zIndex"]
                ? -1
                : b.properties.options["zIndex"] >
                  a.properties.options["zIndex"]
                ? 1
                : 0
            )
            .map((layer, index) => (
              <div
                className={
                  "app filled " +
                  layer.type +
                  (selection === layer.id ? " active" : "")
                }
                draggable={true}
                onDragStart={(event) => this.handleDragStart(event, index)}
                onDragOver={this.handleDragOver}
                onDrop={(event) => this.handleDrop(event, index)}
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
                  {layer.properties.parameter in Translate
                    ? Translate[layer.properties.parameter][language]
                    : ""}
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
    var {
      selection,
      layers,
      images,
      language,
      addLayer,
      updateOptions,
      minDate,
      maxDate,
    } = this.props;
    if (selection === false) {
      return;
    } else if (selection === "add") {
      return (
        <div className="selection">
          <div className="title">{Translate.addlayers[language]}</div>
          <div className="layers">
            {layers.map((l) => (
              <div
                className={l.active ? "layer disabled" : "layer"}
                key={l.id}
                onClick={() => addLayer(l.id)}
                title={l.active ? "" : "Add to map"}
              >
                <div className={"icon " + l.type}>
                  <img
                    src={images[l.properties.parameter]}
                    alt={l.properties.parameter}
                  />
                </div>
                <div className="text">
                  <div className="parameter">
                    {l.properties.parameter in Translate
                      ? Translate[l.properties.parameter][language]
                      : ""}
                  </div>
                  <div className="model">{l.properties.model}</div>
                  <div className="type">
                    {l.type in Translate ? Translate[l.type][language] : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else if (Number.isInteger(selection)) {
      var layer = layers.find((l) => l.id === selection);
      return (
        <div className="selection">
          <div className="layer-description">
            <ShowMoreText
              text={layer.description ? layer.description : ""}
              links={layer.links ? layer.links : {}}
              maxLength={130}
            />
          </div>
          <LayerSettings
            layer={layer}
            updateOptions={updateOptions}
            language={language}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      );
    }
  }
}

class Sidebar extends Component {
  state = {
    images: {
      temperature: temperature_icon,
      velocity: velocity_icon,
      chla: chla_icon,
      secchi: secchi_icon,
      turbidity: turbidity_icon,
      tsm: turbidity_icon,
      realcolor: rgb_icon,
      transect: transect_icon,
      profile: profile_icon,
      particles: particles_icon,
      thermocline: thermocline_icon,
    },
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
      missingDates,
      addLayer,
      minDate,
      maxDate,
      updateOptions,
      sidebarOpen,
      closeSidebar,
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
        <div className={sidebarOpen ? "settings" : "settings hide"}>
          <div
            className="settings-close"
            onClick={closeSidebar}
            title="Close Sidebar"
          >
            <div className="settings-close-inner">&larr;</div>
          </div>
          <div className="settings-buffer">
            <div className="depth-period">
              <select value={depth} onChange={setDepth}>
                {depths.map((d) => (
                  <option value={d} key={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Period
                period={period}
                setPeriod={setPeriod}
                language={language}
                minDate={minDate}
                maxDate={maxDate}
                missingDates={missingDates}
              />
              <div className="labels">
                <div className="depth">{Translate.depth[language]} (m)</div>
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
              updateOptions={updateOptions}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Sidebar;
