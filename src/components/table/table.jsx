import React, { useState } from "react";
import "./table.css";

const SortableTable = ({ data }) => {
  const rows = Object.entries(data).map(([key, value]) => ({ key, ...value }));

  var columns = [
    ...new Set(
      rows.flatMap((row) => Object.keys(row).filter((k) => k !== "link"))
    ),
  ];

  // Set up state for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sorting function
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] ?? "NaN";
    const bValue = b[sortConfig.key] ?? "NaN";

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Function to request sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  columns = columns.filter((c) => c !== "key");

  return (
    <div className="table-outer-container">
      <table className="table-styling">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} onClick={() => handleSort(column)}>
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
                <td key={column}>
                  {row[column] !== undefined ? row[column] : "NaN"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
