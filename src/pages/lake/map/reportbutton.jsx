import { Component, createRef } from "react";
import * as Sentry from "@sentry/react";
import Translations from "../../../translations.json";

class ReportButton extends Component {
  buttonRef = createRef();

  componentDidMount() {
    const feedback = Sentry.getFeedback();
    if (feedback && this.buttonRef.current) {
      feedback.attachTo(this.buttonRef.current, {
        formTitle: "Report an Issue",
      });
    }
  }

  render() {
    const { language, graphSelection, graphHide, graphFull } = this.props;

    let bottom = 20;
    if (graphSelection && !graphFull) {
      bottom = graphHide ? 20 : "calc(33vh + 20px)";
    }

    return (
      <button
        ref={this.buttonRef}
        className="report-button"
        style={{ bottom }}
        title={Translations.reportAnIssue[language]}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </button>
    );
  }
}

export default ReportButton;
