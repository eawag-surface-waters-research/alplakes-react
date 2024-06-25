import React, { Component } from "react";
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
    document.title = "API | Alplakes";
    var { language } = this.props;
    var { error } = this.state;
    return (
      <React.Fragment>
        <NavBar {...this.props} relative={true} />
        <div className="api-container">
          <div className="header"> {Translations["apiHeader"][language]}</div>
          <div className="text">{Translations["apiDesc"][language]}</div>
          <div className="contact">
            {Translations["apiContact"][language]}{" "}
            {Translations["apiWarning"][language]}
          </div>
          {error ? (
            <div className="error">
              <img src={unpluggedIcon} alt="unplugged" />
              We are experiencing connection issues.
              <div className="suberror">Try accessing the documentation directly <a href={`${CONFIG.alplakes_api}/docs`}>here</a> or try again later.</div>
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
