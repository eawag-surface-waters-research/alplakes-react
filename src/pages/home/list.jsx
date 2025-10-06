import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import SummaryTable from "../../components/summarytable/summarytable";
import Translations from "../../translations.json";
import { onMouseOver, onMouseOut } from "./functions";
import "./home.css";

class ListItemSkeleton extends Component {
  render() {
    return (
      <div className="list-item-skeleton">
        <div className="text-skeleton">
          <div className="name-skeleton" />
        </div>
        <div className="logos-skeleton">
          <div className="logo-skeleton" />
          <div className="logo-skeleton" />
          <div className="logo-skeleton" />
        </div>
        <div className="sketelon-graph">
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block" />
          <div className="skeleton-block right" />
        </div>
        <div className="skeleton-data" />
      </div>
    );
  }
}

class List extends Component {
  render() {
    var {
      language,
      sortedList,
      results,
      search,
      filterTypes,
      filters,
      setFavorties,
      favorites,
      sort,
    } = this.props;
    return (
      <div className="list">
        <div className="product-wrapper">
          <div className="product-list">
            {results === 0 &&
              (search.length > 0 ? (
                <div className="empty">{Translations.noresults[language]}</div>
              ) : (
                <React.Fragment>
                  {[...Array(12).keys()].map((a) => (
                    <ListItemSkeleton key={a} />
                  ))}
                </React.Fragment>
              ))}
            {sortedList
              .filter((lake) => lake.display && !lake.filter)
              .map((lake) => (
                <VirtualizedListItem
                  lake={lake}
                  language={language}
                  key={lake.key}
                  filterTypes={filterTypes}
                  filters={filters}
                  setFavorties={setFavorties}
                  favorites={favorites}
                  sort={sort}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }
}

class VirtualizedListItem extends Component {
  constructor(props) {
    super(props);
    this.state = { shouldRender: false };
    this.placeholderRef = React.createRef();
    this.observer = null;
  }

  componentDidMount() {
    const options = {
      rootMargin: "500px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !this.state.shouldRender) {
        this.setState({ shouldRender: true });
        this.observer.disconnect();
        this.observer = null;
      }
    }, options);

    if (this.placeholderRef.current) {
      this.observer.observe(this.placeholderRef.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  render() {
    const { shouldRender } = this.state;
    if (!shouldRender) {
      return (
        <div ref={this.placeholderRef}>
          <ListItemSkeleton />
        </div>
      );
    }
    return <ListItem {...this.props} />;
  }
}

class ListItem extends Component {
  render() {
    const {
      lake,
      language,
      filterTypes,
      filters,
      setFavorties,
      favorites,
      sort,
    } = this.props;

    const selected = favorites.includes(lake.key);
    const units = {
      elevation: Translations.elevationUnit[language],
      max_depth: "m",
      area: "km²",
    };

    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className="list-item"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={Translations.click[language]}
        >
          <div className="properties">
            <div className="left">
              {lake.name[language]}
              <div
                className={selected ? "favorite full" : "favorite"}
                title={selected ? "Remove" : "Save"}
                onClick={(event) => {
                  event.preventDefault();
                  setFavorties(lake.key);
                }}
              >
                &#9733;
              </div>
              {sort in lake && (
                <div className="filter-property">
                  {lake[sort]} {units[sort]}
                </div>
              )}
            </div>
            <div className="right">
              <div className="view">
                {filterTypes
                  .filter((f) => lake.filters.includes(f.id))
                  .map((f) => (
                    <img
                      className={filters.includes(f.id) ? "select" : ""}
                      key={f.id}
                      src={f.icon}
                      alt={f.description}
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className="summary">
            {lake.summary && (
              <div className="summary-table">
                <SummaryTable
                  start={lake.start}
                  end={lake.end}
                  dt={lake.time}
                  value={lake.values}
                  summary={lake.summary}
                  unit={"°"}
                  language={language}
                />
              </div>
            )}
          </div>
        </div>
      </NavLink>
    );
  }
}

export default List;
