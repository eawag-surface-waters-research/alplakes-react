import React, { Component } from "react";
class ShowMoreText extends Component {
    state = {
      showFullText: false,
    };
  
    toggleText = (event) => {
      event.preventDefault();
      this.setState({
        showFullText: !this.state.showFullText,
      });
    };
  
    render() {
      const { text, links, maxLength } = this.props;
      const { showFullText } = this.state;
  
      const truncatedText =
        text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  
      var show = showFullText ? text : truncatedText;
  
      return (
        <div onClick={this.toggleText}>
          <p>
            {show.split("@").map((t) =>
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
          </p>
        </div>
      );
    }
  }

export default ShowMoreText