import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import LakeList from "../../lakelist.json";
import NavBar from "../../components/navbar/navbar";
import LakeMap from "../../components/leaflet/lakemap";
import area from "../../img/area.png";
import elevation from "../../img/elevation.png";
import depth from "../../img/depth.png";
import example from "../../img/example.png";

import "./home.css";

class Lake extends Component {
  state = {};
  render() {
    var { lake, language } = this.props;
    return (
      <NavLink to={`/lake/${lake.key}`}>
        <div className="lake">
          <div className="image">
            <img src={example} />
          </div>
          <div className="properties">
            <div className="name">{lake.name[language]}</div>
            <div className="type">{lake.type[language]}</div>
            <div className="parameters">
              <div className="parameter">
                <img src={area} alt="Area" />
                {lake.area}km&#178;
              </div>
              <div className="parameter">
                <img src={depth} alt="Area" />
                {lake.depth}m
              </div>
              <div className="parameter">
                <img src={elevation} alt="Area" />
                {lake.elevation}m a.s.l
              </div>
            </div>
          </div>
        </div>
      </NavLink>
    );
  }
}

class Home extends Component {
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content">
            <div className="sorting">
              <input
                type="search"
                placeholder={Translate.search[language]}
                className="dark-inset"
              />
            </div>
            <div className="products">
              {LakeList.map((lake) => (
                <Lake lake={lake} language={language} />
              ))}
            </div>
          </div>
        </div>
        <div className="secondary">
          <LakeMap lakes={LakeList} language={language} />
        </div>
      </div>
    );
  }
}

export default Home;
