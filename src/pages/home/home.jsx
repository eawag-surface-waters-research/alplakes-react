import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import Loading from "../../components/loading/loading";
import Translations from "../../translations.json";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import threed_icon from "../../img/threed-icon.png";
import satellite_icon from "../../img/satellite-icon.png";
import ascending_icon from "../../img/ascending.png";
import descending_icon from "../../img/descending.png";
import { onMouseOver, onMouseOut } from "./functions";
import CONFIG from "../../config.json";
import "./home.css";

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
              <div className="location">{lake.latitude}, {lake.longitude}</div>
              <div className="parameters">
                {desc[0]} <div className="stats">{lake.elevation}m</div>
                {desc[1]} <div className="stats">{lake.area}km&#178;</div>
                {desc[2]} <div className="stats">{lake.depth}m</div>
                {desc[3]} <div className="stats">{lake.maxdepth}m.</div>
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
    var { language } = this.props;
    var { list, sort, ascending } = this.state;
    if (sort !== "sortby") {
      list = this.sortList(list, sort, ascending);
    }
    return (
      <div className="home">
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
                src={ascending ? ascending_icon : descending_icon}
                alt="Sort"
              />
            </button>
          </div>
          <div className="products">
            {list.length === 0 ? (
              <Loading marginTop={20} dark={true} />
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
