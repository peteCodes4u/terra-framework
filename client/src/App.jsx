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
  const [isStyle1Active, setIsStyle1Active] = useState(() => {
    const savedStyle = localStorage.getItem("selectedStyle");
    return savedStyle ? savedStyle === "app-style1" : true;
  });

  // Apply the class to the body element and save the style in localStorage
  useEffect(() => {
    const selectedStyle = isStyle1Active ? "app-style1" : "app-style2";
    document.body.className = selectedStyle;
    localStorage.setItem("selectedStyle", selectedStyle);
  }, [isStyle1Active]);

  // Function to toggle the active stylesheet
  const toggleStylesheet = () => {
    setIsStyle1Active(!isStyle1Active);
  };

  return (
    <>
      <Header  toggleStylesheet={toggleStylesheet} />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
