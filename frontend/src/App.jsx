import "./App.css";

import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";

import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import axios from "axios";

import MainPage from "./page/MainPage/MainPage";
import About from "./page/About/About";
import Board from "./page/Board/Board";
import Leadership from "./page/Leadership/Leadership";
import Services from "./page/services/Services";
import Contact from "./page/Contact/Contact";

import AdminLogin from "./page/Admin/AdminLogin";
import { useEffect, useState } from "react";

function AuthRedirectRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try{
        const response = await axios.post("http://localhost:3000/api/auth/verify-token", {}, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        console.log("토큰 인증 실패: " + error);
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  if(isAuthenticated === null){
    return null;
  }

  return isAuthenticated ? <Navigate to="/admin/posts" replace /> : <Outlet />;
}

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
  },
  {
    path: "/admin",
    element: <AuthRedirectRoute />,
    children: [{ index: true, element: <AdminLogin />}],
  },
])

function App() {
  return <RouterProvider router={router} />;
}

export default App;
