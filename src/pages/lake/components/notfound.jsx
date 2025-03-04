import React, { Component } from "react";

class NotFound extends Component {
  render() {
    var { id, text } = this.props;
    return (
      <div className="not-found">
        <div className="fourzerofour">404</div>
        {text && (
          <div className="inner">
            Sorry the lake <div className="title">{id}</div> cannot be found.
          </div>
        )}
      </div>
    );
  }
}

export default NotFound;