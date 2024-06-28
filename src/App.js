import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/errorboundary/errorboundary";
import Home from "./pages/home/home";
import Lake from "./pages/lake/lake";
import API from "./pages/api/api";
import About from "./pages/about/about";
import "./App.css";

class App extends Component {
  state = {
    languages: ["EN", "DE", "FR", "IT"],
    language:
      JSON.parse(localStorage.getItem("language")) === null
        ? "EN"
        : JSON.parse(localStorage.getItem("language")),
    dark:
      JSON.parse(localStorage.getItem("dark")) === null
        ? false
        : JSON.parse(localStorage.getItem("dark")),
  };
  delectLighting = () => {};
  setLanguage = (event) => {
    localStorage.setItem("language", JSON.stringify(event.target.value));
    this.setState({ language: event.target.value });
  };
  toggleDark = () => {
    localStorage.setItem("dark", JSON.stringify(!this.state.dark));
    this.setState({ dark: !this.state.dark });
  };
  componentDidMount() {
    var url = window.location.href;
    var { languages } = this.state;
    for (let language of languages) {
      if (url.includes("?" + language.toLowerCase())) {
        this.setState({ language });
      }
    }
    if (
      JSON.parse(localStorage.getItem("dark")) === null &&
      window.matchMedia
    ) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.setState({ dark: true });
      }
    }
    return "light";
  }
  render() {
    var { dark } = this.state;
    return (
      <React.Fragment>
        <div className={dark ? "main dark" : "main"}>
          <div className="upgrade-message">
            From July Alplakes will have a new look. With more lakes and a
            redesigned interface we hope to provide users with an even better
            experience. For those who want a preview of the new site click{" "}
            <a href="https://pr-28.d21l70hd8m002c.amplifyapp.com/">here</a>.
          </div>
          <div
            className={dark ? "background-color dark" : "background-color"}
          />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <Home
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                    />
                  </ErrorBoundary>
                }
                exact
              />
              <Route
                path="/api"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <API
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                    />
                  </ErrorBoundary>
                }
                exact
              />
              <Route
                path="/about"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <About
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                    />
                  </ErrorBoundary>
                }
                exact
              />
              <Route
                path="/*"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <Lake
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                    />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
