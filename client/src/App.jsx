// the App.jsx file is the main App component
// this file establishes the layout of the application and the routes to the different pages 

import { useEffect, useState } from "react";

// import styling
import "./AppStyle1.css";
import './AppStyle2.css';
import "./AppStyle3.css";
import "./AppStyle4.css";

import 'bootstrap/dist/css/bootstrap.min.css';

// Outlet is used to render nested routes
import { Outlet } from "react-router-dom";

// import navbar component
import Footer from "./components/Footer";
import Header from "./components/Header";
import { StyleContext } from "./StyleContext";

// define the main app component
function App() {
  // Initialize state with the saved style from localStorage or default to true
  const [activeStyle, setActiveStyle] = useState(() => localStorage.getItem("selectedStyle") || "app-style1");

  // Apply the class to the body element and save the style in localStorage
  useEffect(() => {
    document.body.className = activeStyle;
    localStorage.setItem("selectedStyle", activeStyle);
  }, [activeStyle]);

  return (
    <StyleContext.Provider value={{ activeStyle, setActiveStyle }}>
      <Header
        activeStyle={activeStyle}
        setActiveStyle={setActiveStyle}
      />
      <Outlet />
      <Footer activeStyle={activeStyle}/>
    </StyleContext.Provider>
  );
}

export default App;
