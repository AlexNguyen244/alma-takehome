import React, { useEffect, useState } from "react";

function View() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/getLeads")
      .then((res) => res.json())
      .then((data) => setLeads(data))
      .catch((err) => console.error(err));
  }, []);

  if (leads.length === 0) return <p>Loading...</p>;

  // Dynamically get column names from the first row, except resume and id
  const columns = Object.keys(leads[0]).filter((col) => col !== "resume" && col !== "id");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Leads Table</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col}>{lead[col]}</td>
              ))}
              <td>
                {lead.resume ? (
                  <button
                    onClick={() => window.open(lead.resume, "_blank")}
                    style={{
                      padding: "0.3rem 0.6rem",
                      background: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                ) : (
                  "No file"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default View;