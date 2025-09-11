import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "../images/logo.png";

function HomePage({ token }) {
  const navigate = useNavigate();

  // Decode token to get role
  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token); // use jwtDecode instead of jwt_decode
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        top: "35%",
        transform: "translate(-50%, -50%)",
        borderRadius: "15px",
        textAlign: "center",
      }}
    >
      {/* Logo + Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
          gap: "12px",
        }}
      >
        <img src={logo} alt="Alma Logo" style={{ width: "50px", height: "50px" }} />
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1f2937" }}>
          Alma
        </h1>
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "250px",
          margin: "0 auto",
        }}
      >
        {/* Public button */}
        <button
          onClick={() => navigate("/create")}
          style={{
            padding: "10px",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            cursor: "pointer",
          }}
        >
          Create New Lead
        </button>

        {/* Admin-only button */}
        {token && role === "admin" && (
          <button
            onClick={() => navigate("/view")}
            style={{
              padding: "10px",
              backgroundColor: "#16a34a",
              color: "white",
              fontWeight: "600",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            View Leads
          </button>
        )}
      </div>
    </div>
  );
}

export default HomePage;