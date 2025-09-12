import { Link } from "react-router-dom";

function ErrorPage() {
  const title = "Oops! Something went wrong";
  const message = "The page you are trying to access is unavailable or you do not have permission.";

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 pt-24">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{title}</h1>
        <p className="text-gray-700 mb-6">{message}</p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
