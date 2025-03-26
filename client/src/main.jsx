// the main.jsx file is the main entry point for the application
// this file renders the main App component and the routes to the different pages

// import react and react-dom for rendering the app
import ReactDOM from "react-dom/client";
import { useState } from "react";

// import the createBrowserRouter and RouterProvider components from react-router-dom
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import the bootstrap css file
import "bootstrap/dist/css/bootstrap.min.css";

// import the App component and the Page1 component
import App from "./App.jsx";
import Page1 from "./pages/Page1";
import ProfilePage from "./pages/ProfilePage.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Navbar from "./components/Navbar.jsx";

// Create a main function to manage state to implement the ability to add a drop down when a user logs in
const Main = () => {
  // This gives us the ability to track a users login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // This gives us the ability to track a users ID
  const [userId, setUserId] = useState(null);

  // create the router
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar isLoggedIn={isLoggedIn} userId={userId} />
          <App />
        </>
      ),
      errorElement: <h1 className="display-2">Wrong page!</h1>,
      // define the routes for the different pages
      children: [
        {
          // define the route for the home page (currently the same as the page1 page)
          index: true,
          element: <Page1 />,
        },
        {
          // define the route for the page1 page
          path: "/page1",
          element: <Page1 />,
        },
        // define the route for the profile page
        {
          path: "/profile/:id",
          element: <ProfilePage />,
        },
        {
          // This is where we would define the route for the login page
          path: "/login",
          element: (
            <LoginForm setIsLoggedIn={setIsLoggedIn} setUserId={setUserId} />
          ),
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};
// render the app
ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
