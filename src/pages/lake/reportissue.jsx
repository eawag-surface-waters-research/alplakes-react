import React, { Component } from "react";
import axios from "axios";
import "./lake.css";

class ReportIssue extends Component {
  state = {
    open: false,
    reported: false,
    error: false,
    message: "",
    email: "",
  };

  openModal = () => {
    this.setState({ open: true });
  };

  closeModal = () => {
    this.setState({ open: false });
  };

  updateMessage = (event) => {
    this.setState({ message: event.target.value });
  };

  updateEmail = (event) => {
    this.setState({ email: event.target.value });
  };

  submitReport = async () => {
    var { message, email } = this.state;
    var { metadata } = this.props
    var content = {
      from: {
        email: "runnalls.james@gmail.com",
      },
      personalizations: [
        {
          to: [
            {
              email: "james.runnalls@eawag.ch",
            },
          ],
          dynamic_template_data: {
            dataset: metadata.lake_id,
            email: email,
            url: window.location.href,
            message: message + JSON.stringify(metadata),
          },
        },
      ],
      template_id: "d-819e0202b4724bbb99069fdff49d667a",
    };
    try {
      await axios.post("https://api.datalakes-eawag.ch/contact", content);
      this.setState({ reported: true, error: false });
    } catch (e) {
      console.error(e);
      this.setState({ error: true });
    }
  };

  render() {
    const { open, reported, error } = this.state;
    return (
      <div className="report-issue">
        <button onClick={this.openModal}>Report Issue</button>
        <div
          className={open ? "report-issue-modal" : "report-issue-modal hide"}
        >
          <div className="report-issue-modal-inner">
            <div className="close" onClick={this.closeModal}>
              &#215;
            </div>
            <h2>Report Issue</h2>
            <p>
              Thanks for filling out an issue report, please add a message
              describing the issue and include your email address if you are
              happy to be contacted regarding the issue.
            </p>
            <textarea
              placeholder="Please type your report here."
              onChange={this.updateMessage}
              readOnly={reported}
            />
            <input
              type="text"
              placeholder="Email address"
              onChange={this.updateEmail}
              readOnly={reported}
            />
            {reported ? (
              <p>
                Thanks for submitting a data report. We will look into it as
                soon as possible.
              </p>
            ) : (
              <div className="modal-submit">
                {error &&
                  "Failed to submit please refresh the page and try again."}
                <button className="click" onClick={this.submitReport}>
                  Submit Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ReportIssue;
