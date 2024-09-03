import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import CreateProblem from "./pages/CreateProblem";
import TakeTest from "./pages/TakeTest";
import EditProblem from "./pages/EditProblem";
import PageNotFound from "./pages/PageNotFound";
import "./styles/App.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "/problem",
    element: <CreateProblem></CreateProblem>,
  },
  {
    path: "/test/:id",
    element: <TakeTest></TakeTest>,
  },
  {
    path: "/update/:id",
    element: <EditProblem></EditProblem>,
  },
  {
    path: "*",
    element: <PageNotFound></PageNotFound>,
  },
]);

function App() {
  return (
    <div className="App">
      <main className="App_content">
        <RouterProvider router={router}></RouterProvider>
      </main>
    </div>
  );
}

export default App;
