"use client";

import React, { useState } from "react";
import "./home.css";
import { useRouter } from "next/navigation";
import { postDataAPI } from "../../utils/fetchData";
import { toast } from 'sonner';

function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createPipeline = async () => {
    try {
      setLoading(true);

      const res = await postDataAPI(
        "/api/pipeline/create-default",
        {},
        true,
        "",
        "application/json"
      );

      const id = res?.data?.pipeline?._id;
      if (!id) throw new Error("ID not returned");

      router.push(`/pipeline/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create pipeline");
    } finally {
      setLoading(false);
      toast.success("Successfully created Pipeline")
    }
  };

  return (
    <>
      <header className="header gradient-bg">
        <div className="header_text_wrapper">
          <div className="header_text">
            <h1>Spin Up a New Dynamic ETL Pipeline</h1>
            <button onClick={createPipeline} disabled={loading}>
              {loading ? "Creating..." : "Create New +"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Page;
