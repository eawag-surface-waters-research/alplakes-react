import React, { useState } from "react";
import "./table.css";

const SortableTable = ({ data, columns, language, label }) => {
  const rows = Object.entries(data).map(([key, value]) => ({ key, ...value }));

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // State for fullscreen toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sorting function
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key]["value"] ?? "NaN";
    const bValue = b[sortConfig.key]["value"] ?? "NaN";

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

  // Toggle fullscreen mode
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const downloadCSV = () => {
    const header = columns.map((col) => col.value).join(",");
    const rowsData = sortedRows.map((row) =>
      columns.map((col) => `"${row[col.key].value ?? ""}"`).join(",")
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
      <div className="table-background" onClick={toggleFullscreen} />
      <div className="table-inner-container">
        <table className="table-styling">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{ textAlign: column.key === "name" ? "left" : "center" }}
                  title={ "title" in column ? column.title : column.value}
                >
                  {column.value}
                  {sortConfig.key === column.key ? (
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
                onClick={() => row.function && row.function()}
                style={{ cursor: row.function ? "pointer" : "default" }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{ textAlign: column.key === "name" ? "left" : "center" }}
                    title={row[column.key]["value"] !== undefined ? row[column.key]["value"] : "NaN"}
                  >
                    {row[column.key]["value"] !== undefined ? row[column.key]["value"] : "NaN"}
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
