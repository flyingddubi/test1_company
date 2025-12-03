import "./App.css";

import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import MainPage from "./page/MainPage/MainPage";
import About from "./page/About/About";
import Board from "./page/Board/Board";
import Leadership from "./page/Leadership/Leadership";
import Services from "./page/services/Services";
import Contact from "./page/Contact/Contact";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children:[
      {
        index: true,
        element: <MainPage />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "leadership",
        element: <Leadership />
      },
      {
        path: "board",
        element: <Board />
      },
      {
        path: "our-services",
        element: <Services />
      },
      {
        path: "contact",
        element: <Contact />
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />;
}

export default App;
