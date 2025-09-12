import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ViewPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User must log in.");
      navigate("/error", { replace: true }); // Redirect to error page
      return;
    }

    fetch("http://localhost:8000/getLeads", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 403) {
          // Unauthorized access
          navigate("/error", { replace: true });
          return;
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || data.length === 0) {
          navigate("/error", { replace: true }); // No leads available
        } else {
          setLeads(data);
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/error", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  const columns = Object.keys(leads[0] || {}).filter(
    (col) => col !== "resume" && col !== "id"
  );

  const handleStateChange = (id, newState) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead.id === id ? { ...lead, state: newState } : lead))
    );
  };

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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(leads),
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Leads Status</h1>
      <p className="mb-4">Change the state for each lead as needed</p>

      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((col) => (
              <th key={col} className="border border-gray-400 px-4 py-2">
                {col}
              </th>
            ))}
            <th className="border border-gray-400 px-4 py-2">Resume</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              {columns.map((col) => (
                <td key={col} className="border border-gray-400 px-4 py-2">
                  {col === "state" ? (
                    <select
                      value={lead.state}
                      onChange={(e) => handleStateChange(lead.id, e.target.value)}
                      className="border border-gray-300 rounded p-1"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REACHED_OUT">REACHED_OUT</option>
                    </select>
                  ) : (
                    lead[col]
                  )}
                </td>
              ))}
              <td className="border border-gray-400 px-4 py-2">
                {lead.resume ? (
                  <button
                    onClick={() => window.open(lead.resume, "_blank")}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
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

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`mt-4 px-4 py-2 rounded text-white ${
          submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default ViewPage;
