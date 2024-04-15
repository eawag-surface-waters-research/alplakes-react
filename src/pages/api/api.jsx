import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import "./api.css";
import Footer from "../../components/footer/footer";

class API extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    document.title = "API | Alplakes";
    return (
      <React.Fragment>
        <NavBar {...this.props} relative={true} />
        <div className="api-container">
          <div className="header">API Documentation</div>
          <div className="text">
            Discover the public endpoints driving alplakes.eawag.ch, connect to
            them, and leverage our data for your applications.
          </div>
          <div className="contact">
            See our about page for any questions regarding the API.
          </div>
          <SwaggerUI
            url={CONFIG.alplakes_api + "/openapi.json"}
            docExpansion="list"
          />
        </div>
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default API;
