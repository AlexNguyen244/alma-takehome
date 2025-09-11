import React, { useEffect, useState } from "react";

function View() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // new state for submit button

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get JWT from localStorage
    if (!token) {
      console.error("No token found. User must log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/getLeads", {
      headers: {
        "Authorization": `Bearer ${token}`, // Attach JWT
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setLeads(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (leads.length === 0) return <p>No leads available</p>;

  // Dynamically get column names from the first row, except resume and id
  const columns = Object.keys(leads[0]).filter((col) => col !== "resume" && col !== "id");

  // Handle state dropdown change
  const handleStateChange = (id, newState) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, state: newState } : lead
      )
    );
  };

  // Handle submit
  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Cannot submit.");
      return;
    }

    setSubmitting(true);

    fetch("http://localhost:8000/updateLeads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(leads), // send the full leads array
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Update successful:", data);
        alert("Leads updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating leads:", err);
        alert("Failed to update leads.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Leads Table</h1>
      <p>Change the state for each lead as needed</p>
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
          {leads.map((lead) => (
            <tr key={lead.id}>
              {columns.map((col) => (
                <td key={col}>
                  {col === "state" ? (
                    <select
                      value={lead.state}
                      onChange={(e) => handleStateChange(lead.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REACHED_OUT">REACHED_OUT</option>
                    </select>
                  ) : (
                    lead[col]
                  )}
                </td>
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

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: submitting ? "#ccc" : "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default View;
