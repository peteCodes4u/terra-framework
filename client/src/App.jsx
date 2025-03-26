// the App.jsx file is the main App component
//  this file establishes the layout of the application and the routes to the different pages
// the Navbar component is imported and rendered in this file

// import styling
import "./App.css";
// import react-router-dom components for routing
// Outlet is used to render nested routes
// Link is used to create links to other pages
import { Outlet } from "react-router-dom";

// import navbar component
// import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// define the main app component
function App() {
  return (
    <>
      {/* <Navbar isLoggedIn={isLoggedIn} userId={userId} /> */}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
