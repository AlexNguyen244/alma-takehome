import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import RootPage from "./pages/RootPage";
import ErrorPage from "./pages/ErrorPage";
import CreatePage from "./pages/CreatePage";
import ViewPage from "./pages/ViewPage";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Save token from redirect after Google login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newToken = params.get("token");
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Router with HomePage receiving the token as a prop
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
    <div>
      {/* Global Header */}
      <header className="p-4 flex justify-between bg-gray-100 shadow">
        <div>
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Login with Google
            </button>
          )}
        </div>
      </header>

      {/* Page Router */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;