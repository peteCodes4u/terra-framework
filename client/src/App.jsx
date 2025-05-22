// the App.jsx file is the main App component
//  this file establishes the layout of the application and the routes to the different pages 

import { useEffect, useState } from "react";

// import styling
import "./AppStyle1.css";
import './AppStyle2.css';

import 'bootstrap/dist/css/bootstrap.min.css';

// Outlet is used to render nested routes
import { Outlet } from "react-router-dom";

// import navbar component
import Footer from "./components/Footer";
import Header from "./components/Header";

// define the main app component
function App() {
  // Initialize state with the saved style from localStorage or default to true
  const [activeStyle, setActiveStyle] = useState(() => {
    return localStorage.getItem("selectedStyle") || "app-style1";
  });

  // Apply the class to the body element and save the style in localStorage
  useEffect(() => {
    document.body.className = activeStyle;
    localStorage.setItem("selectedStyle", activeStyle);
  }, [activeStyle]);

  return (
    <>
      <Header
        isStyle1Active={activeStyle === "app-style1"}
        setIsStyle1Active={(isStyle1Active) => setActiveStyle(isStyle1Active ? "app-style1" : "app-style2")}
      />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
