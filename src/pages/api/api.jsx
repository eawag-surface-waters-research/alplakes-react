import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import unpluggedIcon from "../../img/unplugged.png";
import axios from "axios";
import "./api.css";

class API extends Component {
  state = {
    error: false,
  };
  async componentDidMount() {
    window.scrollTo(0, 0);
    try {
      await axios.get(`${CONFIG.alplakes_api}`);
    } catch (e) {
      this.setState({ error: true });
    }
  }
  render() {
    var { language } = this.props;
    var { error } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>API | Alplakes</title>
          <meta
            name="description"
            content="Discover the public endpoints powering Alplakes, connect to them, and leverage our data for your applications."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="api-container">
          <h1 className="header"> {Translations["apiHeader"][language]}</h1>
          <div className="text">
            Alplakes API connects you to lake products produced by the SURF
            department at EAWAG. This includes terabytes of simulation data and
            remote sensing products. The API supports geospatial and temporal
            queries, allowing access to subsets of the data for easier handling.
          </div>
          <div className="text">
            Please email{" "}
            <a href="mailto:james.runnalls@eawag.ch">james.runnalls@eawag.ch</a>{" "}
            for any questions regarding the API or to be kept informed of any
            future updates.
          </div>
          {error ? (
            <div className="error">
              <img src={unpluggedIcon} alt="unplugged" />
              We are experiencing connection issues.
              <div className="suberror">
                Try accessing the documentation directly{" "}
                <a href={`${CONFIG.alplakes_api}/docs`}>here</a> or try again
                later.
              </div>
            </div>
          ) : (
            <SwaggerUI
              url={CONFIG.alplakes_api + "/openapi.json"}
              docExpansion="list"
              responseInterceptor={(response) => {
                if (response.status >= 400) {
                  // Handle client or server errors
                  console.error("Error response:", response);
                } else {
                  // Handle successful responses
                }
                return response;
              }}
            />
          )}
        </div>
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default API;
