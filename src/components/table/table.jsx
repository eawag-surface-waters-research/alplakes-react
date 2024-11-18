import React, { useState } from "react";
import Translations from "../../translations.json";
import "./table.css";

const SortableTable = ({ data, language, label }) => {
  const rows = Object.entries(data).map(([key, value]) => ({ key, ...value }));

  var columns = [
    ...new Set(
      rows.flatMap((row) => Object.keys(row).filter((k) => k !== "link"))
    ),
  ];

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // State for fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sorting function
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] ?? "NaN";
    const bValue = b[sortConfig.key] ?? "NaN";

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Request sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  columns = columns.filter((c) => c !== "key");

  // Toggle fullscreen mode
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const unitDict = {
    elevation: " (m)",
    depth: " (m)",
    area: " (km²)",
    overallrmse: " (°C)",
    surfacermse: " (°C)",
    bottomrmse: " (°C)",
    MdSA: " (%)",
  };

  const titleDict = {
    RMSE: "Root mean squared error",
    MAD: "Median absolute deviation",
    MdSA: "Median symmetric accuracy",
  };

  const downloadCSV = () => {
    const header = columns.join(",");
    const rowsData = sortedRows.map((row) =>
      columns.map((col) => `"${row[col] ?? ""}"`).join(",")
    );
    const csvContent = [header, ...rowsData].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = label + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`table-outer-container ${isFullscreen ? "fullscreen" : ""}`}
    >
      <div className="table-inner-container">
        <table className="table-styling">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  style={{ textAlign: column === "name" ? "left" : "center" }}
                  title={
                    column in titleDict
                      ? titleDict[column]
                      : column in Translations
                      ? Translations[column][language]
                      : column
                  }
                >
                  {column in Translations
                    ? Translations[column][language]
                    : column}{" "}
                  {column in unitDict ? unitDict[column] : ""}
                  {sortConfig.key === column ? (
                    sortConfig.direction === "asc" ? (
                      <div>&#x25b4;</div>
                    ) : (
                      <div>&#x25be;</div>
                    )
                  ) : (
                    <div>&#x25b4;&#x25be;</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={index}
                onClick={() => row.link && window.open(row.link, "_blank")}
                style={{ cursor: row.link ? "pointer" : "default" }}
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    style={{ textAlign: column === "name" ? "left" : "center" }}
                    title={row[column] !== undefined ? row[column] : "NaN"}
                  >
                    {row[column] !== undefined ? row[column] : "NaN"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="expand" onClick={toggleFullscreen}>
        {isFullscreen ? "Close" : "Expand"}
      </button>
      <button className="download-table" onClick={downloadCSV}>
        Download
      </button>
    </div>
  );
};

export default SortableTable;
