// this file renders the main App component and the routes to the different pages

// import react and react-dom for rendering the app
import ReactDOM from "react-dom/client";

// import the createBrowserRouter and RouterProvider components from react-router-dom
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import the bootstrap css file
import "bootstrap/dist/css/bootstrap.min.css";

// import the App component and the Page1 component
<<<<<<< HEAD
import App from "./App.jsx";
import Page1 from "./pages/Page1";
import ProfilePage from "./pages/ProfilePage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
=======
import App from './App.jsx'
import Page1 from './pages/Page1.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'

// create the router
const router = createBrowserRouter([
  {
<<<<<<< HEAD
    path: "/",
=======
    path: '/',
>>>>>>> c34999a (Changes completed to route to /login and /signup)
    element: (
      <>
        <App />
      </>
    ),

    errorElement: <ErrorPage />,
    // define the routes for the different pages
    children: [
      {
        // define the route for the home page (currently the same as the page1 page)
        index: true,
        element: <Page1 />,
      },
      {
        // define the route for the page1 page
<<<<<<< HEAD
        path: "/page1",
        element: <Page1 />,
      },
      // define the route for the profile page
      {
        path: "/profile/:id",
        element: <ProfilePage />,
      },
      {
        path: "/booking",
        element: <BookingPage />,
      },
    ],
  },
=======
        path: '/page1',
        element: <Page1 />
      },
      // define the route for the profile page
      {
        path: '/profile/:id',
        element: <ProfilePage />
      }, {
        path: '/login',
        element: <Page1 />,
        children: [
          {
            index: true,
            element: < Login />
          }
        ]
      }, {
        path: '/signup',
        element: <Page1 />,
        children: [
          {
            index: true,
            element: < Signup />
          }
        ]
      }
    ]
  }
>>>>>>> c34999a (Changes completed to route to /login and /signup)
]);

// render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
