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
          <h1>Models</h1>
          <p>
            Alplakes integrates hydrodynamic models and remote sensing products
            developed by the research community. This page details the models
            performance and provides access to downloads related to them.
          </p>
          <h2>3D Hydrodynamic</h2>
          <SortableTable data={three_dimensional} />
          <h3>Downloads</h3>
          <p>
            For downloading subsets of data, please use the tools available when
            viewing the model or look at the API documentation.{" "}
          </p>
          <h4>Input files</h4>
          <p>
            A set of example input files are provided for users that want to
            adapt the models to their own purposes. These files can also be
            generated using the code available <a href="">here</a>. Please note
            users outside of Eawag will need to update the weather data
            collection functions as we are not permitted to distribute weather
            data.
          </p>
          <h2>1D Hydrodynamic</h2>
          <SortableTable data={one_dimensional} />
        </div>
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Models;
