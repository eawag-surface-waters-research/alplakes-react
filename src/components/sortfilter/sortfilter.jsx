import React, { Component } from "react";
import Translations from "../../translations.json";
import sortFilterIcon from "../../img/sort.png";
import Flag from "./flags";
import "./sortfilter.css";

export class SortFilterControls extends Component {
  render() {
    const { language, activeCount, pills, onOpen, onRemovePill, right } =
      this.props;
    return (
      <div className="sort-filter">
        <div className="sort-filter-row">
          <div className="sort-filter-button" onClick={onOpen}>
            <img src={sortFilterIcon} alt="" />
            {Translations.sortAndFilter[language]}
            {activeCount > 0 && <div className="badge">{activeCount}</div>}
          </div>
          {right}
        </div>
        {pills.length > 0 && (
          <div className="sort-filter-pills">
            {pills.map((pill) => (
              <div
                className="pill"
                key={`${pill.type}_${pill.id}`}
                onClick={() => onRemovePill(pill)}
              >
                {pill.type === "country" && <Flag code={pill.id} />}
                {pill.icon && <img src={pill.icon} alt={pill.label} />}
                <div className="pill-label">{pill.label}</div>
                <div className="pill-remove">&#10005;</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export class SortFilterSheet extends Component {
  render() {
    const {
      open,
      language,
      sort,
      setSort,
      filters,
      setFilter,
      countries,
      setCountry,
      sortOptions,
      countryOptions,
      sourceOptions,
      results,
      loaded,
      onClose,
      onClearAll,
    } = this.props;
    if (!open) return null;
    return (
      <React.Fragment>
        <div className="sort-filter-backdrop" onClick={onClose} />
        <div className="sort-filter-sheet">
          <div className="sheet-title">
            {Translations.sortAndFilter[language]}
          </div>
          <div className="sheet-close" onClick={onClose}>
            &#10005;
          </div>
          <div className="sheet-body">
            <div className="sheet-section">
              <div className="section-title">
                {Translations.sortBy[language]}
              </div>
              <div className="section-options">
                {sortOptions.map((option) => (
                  <div
                    className={
                      sort === option.id ? "option selected" : "option"
                    }
                    key={option.id}
                    onClick={() => setSort(sort === option.id ? "" : option.id)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
            {countryOptions.length > 0 && (
              <div className="sheet-section">
                <div className="section-title">
                  {Translations.country[language]}
                </div>
                <div className="section-options">
                  {countryOptions.map((option) => (
                    <div
                      className={
                        countries.includes(option.code)
                          ? "option selected"
                          : "option"
                      }
                      key={option.code}
                      onClick={() => setCountry(option.code)}
                    >
                      <Flag code={option.code} />
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="sheet-section">
              <div className="section-title">
                {Translations.dataSource[language]}
              </div>
              <div className="section-options">
                {sourceOptions.map((option) => (
                  <div
                    className={
                      filters.includes(option.id) ? "option selected" : "option"
                    }
                    key={option.id}
                    title={option.description}
                    onClick={() => setFilter(option.id)}
                  >
                    <img src={option.icon} alt={option.name} />
                    {option.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="sheet-footer">
            <div className="clear-all" onClick={onClearAll}>
              {Translations.clearAll[language]}
            </div>
            <div className="show-lakes" onClick={onClose}>
              {loaded
                ? results === 1
                  ? Translations.showLake[language]
                  : Translations.showLakes[language].replace("#", results)
                : Translations.loadingLakes[language]}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
