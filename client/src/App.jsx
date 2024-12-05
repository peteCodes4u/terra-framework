import "./App.css";
import { Outlet } from "react-router-dom";

import Navbar from "./components/Navbar2";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
