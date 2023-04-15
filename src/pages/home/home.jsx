import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import Translations from "../../translations.json";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import threed_icon from "../../img/threed-icon.png";
import satellite_icon from "../../img/satellite-icon.png";
import ascending_icon from "../../img/ascending.png";
import descending_icon from "../../img/descending.png";
import ascending_icon_dark from "../../img/ascending_dark.png";
import descending_icon_dark from "../../img/descending_dark.png";
import { onMouseOver, onMouseOut } from "./functions";
import CONFIG from "../../config.json";
import "./home.css";

class PlaceHolder extends Component {
  render() {
    var { number } = this.props;
    console.log();
    return (
      <React.Fragment>
        {[...Array(number).keys()].map((a) => (
          <div className="lake" key={a}>
            <div className="placeholder-image"></div>
            <div className="properties">
              <div className="left">
                <div className="placeholder-flag" />
              </div>
              <div className="right">
                <div className="placeholder-name" />
                <div className="placeholder-location" />
              </div>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

class Lake extends Component {
  render() {
    var { lake, language } = this.props;
    var flags = { swiss: swiss, italian: italian, french: french };
    var tags = {
      threed: { img: threed_icon, hover: "3D model available" },
      satellite: { img: satellite_icon, hover: "Satellite imagery available" },
    };
    var desc = Translations.descriptions[language];
    var imgCore = `https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/images/lakes/${lake.key}.png`;
    var imgBehind = `https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/images/lakes/${lake.key}.png`;
    if (lake.animation) imgBehind = imgBehind.replace(".png", ".gif");
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className="lake"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          <div className="image">
            <img src={imgCore} alt="Lake" className="core-image" />
            <img src={imgBehind} alt="Lake" className="behind-image" />
            <div className="tags">
              {lake.tags.map((t) => (
                <div className="tag" key={t} title={tags[t].hover}>
                  <img src={tags[t].img} alt={t} />
                </div>
              ))}
            </div>
          </div>
          <div className="properties">
            <div className="left">
              {lake.flags.map((f) => (
                <img src={flags[f]} alt={f} key={f} />
              ))}
            </div>
            <div className="right">
              <div className="name">{lake.name[language]}</div>
              <div className="location">
                {lake.latitude}, {lake.longitude}
              </div>
              <div className="parameters">
                {desc[0]} <div className="stats">{lake.elevation} m</div>
                {desc[1]} <div className="stats">{lake.area} km&#178;</div>
                {desc[2]} <div className="stats">{lake.depth} m</div>
                {desc[3]} <div className="stats">{lake.maxdepth} m.</div>
              </div>
            </div>
          </div>
        </div>
      </NavLink>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
    sort: "sortby",
    ascending: false,
    defaultNumber: 12,
  };
  setSort = (event) => {
    this.setState({ sort: event.target.value });
  };
  sortList = (list, property, ascending) => {
    var x = 1;
    var y = -1;
    if (ascending) {
      x = -1;
      y = 1;
    }
    return list.sort((a, b) => (a[property] > b[property] ? y : x));
  };
  toggleSort = () => {
    this.setState({ ascending: !this.state.ascending });
  };
  async componentDidMount() {
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket + "list_all.json"
    );
    this.setState({ list });
  }
  render() {
    document.title = "Alplakes";
    var { language, dark } = this.props;
    var { list, sort, ascending, defaultNumber } = this.state;
    if (sort !== "sortby") {
      list = this.sortList(list, sort, ascending);
    }
    return (
      <div className={dark ? "home dark" : "home"}>
        <NavBar {...this.props} />
        <div className="content">
          <div className="sorting">
            <select onChange={this.setSort} value={sort}>
              <option disabled value="sortby">
                {Translations.sortby[language]}
              </option>
              <option value="elevation">
                {Translations.elevation[language]}
              </option>
              <option value="area">{Translations.area[language]}</option>
              <option value="depth">{Translations.depth[language]}</option>
              <option value="maxdepth">
                {Translations.maxdepth[language]}
              </option>
              <option value="latitude">Latitude</option>
              <option value="longitude">Longitude</option>
            </select>
            <button onClick={this.toggleSort} title="Sort Order">
              <img
                src={
                  ascending
                    ? dark
                      ? ascending_icon_dark
                      : ascending_icon
                    : dark
                    ? descending_icon_dark
                    : descending_icon
                }
                alt="Sort"
              />
            </button>
          </div>
          <div className="products">
            {list.length === 0 ? (
              <PlaceHolder number={defaultNumber} />
            ) : (
              list.map((lake) => (
                <Lake lake={lake} language={language} key={lake.key} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
