import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/errorboundary/errorboundary";
import Home from "./pages/home/home";
import Lake from "./pages/lake/lake";
import API from "./pages/api/api";
import About from "./pages/about/about";
import Models from "./pages/models/models";
import "./App.css";
import Map from "./pages/map/map";

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
  setLanguage = (event) => {
    localStorage.setItem("language", JSON.stringify(event.target.value));
    this.setState({ language: event.target.value });
  };
  toggleDark = () => {
    if (this.state.dark) {
      document.documentElement.style.colorScheme = "light";
    } else {
      document.documentElement.style.colorScheme = "dark";
    }
    localStorage.setItem("dark", JSON.stringify(!this.state.dark));
    this.setState({ dark: !this.state.dark });
  };
  componentDidMount() {
    if (JSON.parse(localStorage.getItem("dark")) === null) {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.style.colorScheme = "dark";
        this.setState({ dark: true });
      }
    } else if (JSON.parse(localStorage.getItem("dark"))) {
      document.documentElement.style.colorScheme = "dark";
    }
  }
  render() {
    var { dark } = this.state;
    return (
      <React.Fragment>
        <div className={dark ? "main dark" : "main"}>
          <div className="background" />
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
                path="/models"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <Models
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
                path="/map/*"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <Map
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                      history={this.props.history}
                    />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/*"
                element={
                  <ErrorBoundary {...this.props} {...this.state}>
                    <Lake
                      {...this.state}
                      setLanguage={this.setLanguage}
                      toggleDark={this.toggleDark}
                      history={this.props.history}
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
