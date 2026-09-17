import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import axios from "axios";
import CONFIG from "../../config.json";
import "./blog.css";
import ScrollUp from "../../components/scrollup/scrollup";

class Blog extends Component {
  state = {
    posts: [],
  };
  async componentDidMount() {
    try {
      const { data: posts } = await axios.get(CONFIG.blog_url);
      this.setState({ posts });
    } catch (e) {
      console.error(e);
    }
  }
  postBody = (p) => (
    <React.Fragment>
      <h2>{p.title}</h2>
      <div className="date">{p.date}</div>
      {p.img && (
        <div className="image">
          <img src={p.img} alt={p.title} />
          {p.img_source && <div className="source">{p.img_source}</div>}
        </div>
      )}
      <p>{p.description}</p>
    </React.Fragment>
  );
  render() {
    const { posts } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>Blog - Alplakes</title>
          <meta
            name="description"
            content="Blog posts related to the Alplakes project."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="text-width blog">
          <div className="content">
            <h1>Blog</h1>
            {posts.map((p) =>
              Array.isArray(p.link) ? (
                <div className="post clickable-box" key={p.title}>
                  {this.postBody(p)}
                  <div className="buttons">
                    {p.link.map((link, i) => (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={link}
                      >
                        <div className="button">
                          {Array.isArray(p.link_text)
                            ? p.link_text[i]
                            : "Read more"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={p.title}
                >
                  <div className="post clickable-box">
                    {this.postBody(p)}
                    <div className="button">
                      {"link_text" in p ? p.link_text : "Read more"}
                    </div>
                  </div>
                </a>
              )
            )}
          </div>
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default Blog;
