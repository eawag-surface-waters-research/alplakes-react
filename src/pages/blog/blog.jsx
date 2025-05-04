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
  render() {
    const { posts } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>Blog | Alplakes</title>
          <meta
            name="description"
            content="Blog posts related to the Alplakes project."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="text-width blog">
          <div className="content">
            <h1>Blog</h1>
            {posts.map((p) => (
              <div className="post" key={p.title}>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
                <div className="date">{p.date}</div>
              </div>
            ))}
          </div>
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default Blog;
