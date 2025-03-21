import React, { Component } from "react";
import "./showmore.css";

class ShowMoreText extends Component {
  state = {
    showFullText: false,
  };

  toggleText = (event) => {
    var { toggle } = this.props;
    if (toggle) {
      event.preventDefault();
      this.setState({
        showFullText: !this.state.showFullText,
      });
    }
  };

  render() {
    const { text, links, maxLength } = this.props;
    const { showFullText } = this.state;
    const truncatedText =
      text.length > maxLength ? text.slice(0, maxLength) + " ..." : text;

    var show = showFullText ? text : truncatedText;

    return (
      <div onClick={this.toggleText} className="show-more-text" title="Show more">
        {typeof show === "string" && show.split("@").map((t) =>
          t in links ? (
            <a
              href={links[t][1]}
              target="_blank"
              rel="noopener noreferrer"
              key={t}
            >
              {links[t][0]}
            </a>
          ) : (
            t
          )
        )}
      </div>
    );
  }
}

export default ShowMoreText;
