"use client";

import React, { useEffect, useState } from "react";
import "./sidebar-style.css";
import Link from "next/link";
import { getDataAPI } from "../../utils/fetchData";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [pipelines, setPipelines] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const res = await getDataAPI("/api/pipeline/list");
        setPipelines(res.data.pipelines || []);
      } catch (err) {
        console.error("Failed to fetch pipelines:", err);
      }
    };

    fetchPipelines();
  }, [pathname]);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">MorphETL</h3>

        <Link href={"/"} className="sidebar-item new-item">
          + New Pipeline
        </Link>

        <h4 className="section-subtitle">Past Pipelines</h4>

        {pipelines.length > 0 ? (
          pipelines.map((p) => (
            <Link
              key={p._id}
              href={`/pipeline/${p._id}`}
              className="sidebar-item"
            >
              {p.name}
            </Link>
          ))
        ) : (
          <div className="sidebar-item" style={{ opacity: 0.6 }}>
            No pipelines
          </div>
        )}
      </div>
    </div>
  );
}
