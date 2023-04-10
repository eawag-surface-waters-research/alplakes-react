import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import LakeMap from "../../components/leaflet/lakemap";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import threed_icon from "../../img/threed-icon.png";
import satellite_icon from "../../img/satellite-icon.png";
import URLS from "../../urls.json";
import { onMouseOver, onMouseOut } from "./functions";

import "./home.css";
import Loading from "../../components/loading/loading";

class Lake extends Component {
  render() {
    var { lake, language } = this.props;
    var flags = { swiss: swiss, italian: italian, french: french };
    var tags = {
      threed: { img: threed_icon, hover: "3D model available" },
      satellite: { img: satellite_icon, hover: "Satellite imagery available" },
    };
    return (
      <NavLink to={`/lake/${lake.key}`}>
        <div
          className="lake"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          <div className="image">
            <img
              src={`https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/images/lakes/${lake.key}.png`}
              alt="Lake"
              className="core-image"
            />
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
              <div className="parameters">
                Situated <div className="stats">{lake.elevation}m</div> above
                sea level with a surface area of{" "}
                <div className="stats">{lake.area}km&#178;</div> and an average
                depth of <div className="stats">{lake.depth}m.</div>
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
  };
  async componentDidMount() {
    const { data: list } = await axios.get(URLS.metadata + "list_all.json");
    this.setState({ list });
  }
  render() {
    var { language } = this.props;
    var { list } = this.state;
    document.title = "Alplakes";
    return (
      <div className="home">
        <NavBar language={language} />
        <div className="content">
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
        <div className="">
          <LakeMap lakes={list} language={language} />
        </div>
      </div>
    );
  }
}

export default Home;
