import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import CONFIG from "../../config.json";
import "./models.css";
import SortableTable from "../../components/table/table";

class Models extends Component {
  state = {
    one_dimensional: [],
    three_dimensional: [],
  };
  async componentDidMount() {
    window.scrollTo(0, 0);
    try {
      var { data: one_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/one_dimensional.json`
      );
      var { data: three_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/three_dimensional.json`
      );
      this.setState({ one_dimensional, three_dimensional });
    } catch (error) {
      console.error("Failed to collect metadata from bucket");
    }
  }
  render() {
    var { one_dimensional, three_dimensional } = this.state;
    return (
      <div className="main">
        <Helmet>
          <title>Models | Alplakes</title>
          <meta
            name="description"
            content="Learn more about the Alplakes models."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="models">
          <div className="content">
            <h1>Models</h1>
            <p>
              Alplakes integrates hydrodynamic models and remote sensing
              products developed by the research community. This page details
              the models performance and provides access to downloads related to
              them.
            </p>
            <div id="3d">
              <h2>3D Hydrodynamic</h2>
              <p>
                3D hydrodynamic lake models simulate water movement,
                temperature, and water quality by dividing the lake into a 3D
                grid and solving mathematical equations that govern fluid
                motion, heat transfer, and chemical interactions. They use the
                Navier-Stokes equations to calculate flow dynamics based on
                external forces like wind, inflows, and gravity. Temperature,
                salinity, and other factors create density gradients, which
                drive stratification and mixing processes within the lake.
              </p>
              <p>
                Below is a list of all the 3D models available on the Alplakes
                platform.
              </p>
              <SortableTable data={three_dimensional} />
              <h3>Downloads</h3>
              <p>
                For downloading subsets of data, please use the tools available
                when viewing the model or look at the API documentation.{" "}
              </p>
              <h4>Input files</h4>
              <p>
                A set of example input files are provided for users that want to
                adapt the models to their own purposes. These files can also be
                generated using the code available <a href="">here</a>. Please
                note users outside of Eawag will need to update the weather data
                collection functions as we are not permitted to distribute
                weather data.
              </p>
            </div>
            <div id="1d">
              <h2>1D Hydrodynamic</h2>
              <p>
                1D lake models simplify lake processes by representing the lake
                as a single vertical column, divided into layers from the
                surface to the bottom. Instead of simulating horizontal
                variations, they focus on vertical changes in temperature,
                density, and other properties. These models calculate vertical
                mixing and stratification by solving simplified equations for
                heat and mass transfer, often including modules for water
                quality and biological processes. Because they are less
                computationally intensive, 1D models are efficient for long-term
                studies and are especially useful for deep lakes where vertical
                changes are more significant than horizontal ones.
              </p>
              <SortableTable data={one_dimensional} />
            </div>
            <div id="rs"></div>
          </div>
          <div className="sidebar">
            <div className="sidebar-inner">
              <h3>Contents</h3>
              <div className="link">&#x2022; 3D Hydrodynamic</div>
              <div className="link">&#x2022; 1D Hydrodynamic</div>
              <div className="link">&#x2022; Remote Sensing</div>
            </div>
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Models;
