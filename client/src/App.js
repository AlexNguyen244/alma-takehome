import { RouterProvider, createBrowserRouter } from "react-router-dom"; 
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import HomePage from "./pages/HomePage";
import RootPage from "./pages/RootPage";
import ErrorPage from "./pages/ErrorPage";
import CreatePage from "./pages/CreatePage";
import ViewPage from "./pages/ViewPage";
import logoutIcon from "./images/logout.png";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newToken = params.get("token");
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      window.location.href = "/";
    }
  }, []);

  // Decode token to get user email
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (err) {
        console.error("Invalid token", err);
        setUserEmail(null);
      }
    } else {
      setUserEmail(null);
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserEmail(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootPage />,
      errorElement: <ErrorPage />,
      id: "root",
      children: [
        { index: true, element: <HomePage token={token} /> },
        { path: "create", element: <CreatePage /> },
        { path: "view", element: <ViewPage /> }
      ],
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header */}
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-end items-center bg-gray-100 shadow z-50 space-x-4">
        {token ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium flex items-center space-x-2 cursor-pointer"
            >
              <span>{userEmail}</span>
              <img
                src={logoutIcon}
                alt="Logout"
                onClick={handleLogout}
                className="w-6 h-6"
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center space-x-2"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
              <path d="M533.5 278.4c0-17.6-1.5-34.6-4.4-51.1H272.1v96.9h146.9c-6.3 33.9-25.4 62.6-54.3 81.8v68h87.7c51.3-47.2 80.1-116.8 80.1-196.6z" fill="#4285F4" />
              <path d="M272.1 544.3c73.6 0 135.5-24.3 180.6-66l-87.7-68c-24.4 16.4-55.8 26.1-92.9 26.1-71.5 0-132-48.2-153.6-112.9h-90.3v70.9c45 89.3 136.5 150.9 243.9 150.9z" fill="#34A853" />
              <path d="M118.2 324.4c-10.8-32.5-10.8-67.6 0-100.1V153.4h-90.3c-39.8 78.6-39.8 172.1 0 250.7l90.3-70.9z" fill="#FBBC05" />
              <path d="M272.1 107.7c39.9-.6 77.7 14.6 106.7 41.6l80-80c-48.8-45.3-112.7-73.1-186.7-72.7C135.5 0 45 61.6 0 151l90.3 70.9c21.6-64.7 82.1-112.2 181.8-114.2z" fill="#EA4335" />
            </svg>
            <span>Login with Google</span>
          </button>
        )}
      </header>

      <div className="pt-20">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
