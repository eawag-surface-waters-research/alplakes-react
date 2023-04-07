import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import LakeMap from "../../components/leaflet/lakemap";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import URLS from "../../urls.json";
import { onMouseOver, onMouseOut } from "./functions";

import "./home.css";
import Loading from "../../components/loading/loading";

class Lake extends Component {
  render() {
    var { lake, language } = this.props;
    var flags = { swiss: swiss, italian: italian, french: french };
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
            />
          </div>
          <div className="properties">
            <div className="left">
              {lake.flags.map((f) => (
                <img src={flags[f]} alt={f} key={f} />
              ))}
            </div>
            <div className="right">
              <div className="name">{lake.name[language]}</div>
              <div className="parameters">Elevation {lake.elevation} mAOD</div>
              <div className="parameters">Surface area {lake.area} km2</div>
              <div className="parameters">Average depth {lake.depth} m</div>
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
    const { data: list } = await axios.get(URLS.metadata + "list.json");
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
