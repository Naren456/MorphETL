

import React from "react";
import "./sidebar-style.css";

export default function Sidebar() {
  const pipelines = [
    "Dynamic ETL Pipeline",
    "Sales Aggregator",
    "JSON Cleaner Flow",
    "Customer Data Merge",
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">MorphETL</h3>

        <div className="sidebar-item new-item">
          + New Pipeline
        </div>

        <h4 className="section-subtitle">Past Pipelines</h4>

        {pipelines.map((pipeline, index) => (
          <div key={index} className="sidebar-item">
            {pipeline}
          </div>
        ))}
      </div>
    </div>
  );
}
