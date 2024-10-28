import React, { useState } from "react";

const SortableTable = ({ data }) => {
  // Convert the dictionary to an array of objects
  const rows = Object.entries(data).map(([key, value]) => ({ key, ...value }));

  // Collect all unique keys for columns, excluding "link"
  const columns = [
    "key",
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

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} onClick={() => handleSort(column)}>
              {column}
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
  );
};

export default SortableTable;
