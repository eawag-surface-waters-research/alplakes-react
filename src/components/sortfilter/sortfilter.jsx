import React, { Component } from "react";
import Translations from "../../translations.json";
import sortIcon from "../../img/sortdesc.png";
import Flag from "./flags";
import "./sortfilter.css";

export class SortFilterControls extends Component {
  render() {
    const {
      language,
      activeCount,
      pills,
      onOpen,
      onRemovePill,
      ascending,
      onToggleAscending,
      right,
    } = this.props;
    return (
      <div className="sort-filter">
        <div className="sort-filter-row">
          <div className="sort-filter-button" onClick={onOpen}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="5" x2="21" y2="5" />
              <circle cx="15" cy="5" r="2.6" fill="currentColor" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <circle cx="8" cy="12" r="2.6" fill="currentColor" />
              <line x1="3" y1="19" x2="21" y2="19" />
              <circle cx="16" cy="19" r="2.6" fill="currentColor" />
            </svg>
            {Translations.sortAndFilter[language]}
            {activeCount > 0 && <div className="badge">{activeCount}</div>}
          </div>
          {right}
        </div>
        {pills.length > 0 && (
          <div className="sort-filter-pills">
            {pills.some((pill) => pill.type === "sort") && (
              <div
                className={ascending ? "sort-toggle asc" : "sort-toggle"}
                onClick={onToggleAscending}
              >
                <img src={sortIcon} alt="Sort direction" />
              </div>
            )}
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
