import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import "./api.css";
import Footer from "../../components/footer/footer";

class API extends Component {
  render() {
    document.title = "API | Alplakes";
    return (
      <React.Fragment>
        <NavBar {...this.props} />
        <div className="api-container">
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
