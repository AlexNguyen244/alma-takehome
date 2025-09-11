import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import RootPage from './pages/RootPage';
import ErrorPage from './pages/ErrorPage';
import ViewPage from "./pages/ViewPage";
import CreatePage from "./pages/CreatePage";
import UpdatePage from "./pages/UpdatePage";
import './App.css';

const router =  createBrowserRouter([
  { path: '/', element: <RootPage />, errorElement: <ErrorPage />, id: 'root', children: [
    { index: true, element: <HomePage /> },
    { path: 'view', element: <ViewPage /> },
    { path: 'create', element: <CreatePage /> },
    { path: 'update', element: <UpdatePage /> },
  ]}
])

function App() {
  return <RouterProvider router={router} />;
}

export default App;