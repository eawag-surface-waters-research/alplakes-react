import React, { useState } from "react";
import "./table.css";

const SortableTable = ({ data }) => {
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
                >
                  {column} &#x25b4;&#x25be;
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
    </div>
  );
};

export default SortableTable;
