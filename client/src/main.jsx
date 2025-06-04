// this file renders the main App component and the routes to the different pages

// import react and react-dom for rendering the app
import ReactDOM from "react-dom/client";

// import the createBrowserRouter and RouterProvider components from react-router-dom
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import the bootstrap css file
import "bootstrap/dist/css/bootstrap.min.css";

// import the App component and the Page1 component
import App from './App.jsx'
import BookingPage from './pages/BookingPage.jsx';
import Page1 from './pages/Page1.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'

// create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <App />
      </>
    ),
    // leverage error handling in react-router
    errorElement: <ErrorPage />,
    // define the routes for pages
    children: [
      {
        // define the route for the home page (currently page1 page)
        index: true,
        element: <Page1 />
      }, {
        // page1 
        path: '/page1',
        element: <Page1 />
      },
      // profile page
      {
        path: '/profile/:id',
        element: <ProfilePage />
      },
      // booking page
      {
        path: '/booking',
        element: <BookingPage />
      },
      // login and signup routes
      {
        path: '/login',
        element: <Page1 />,
        // nested routes for login and signup
        children: [
          {
            index: true,
            element: <Login />,
          }
        ]
      }, {
        path: '/signup',
        element: <Page1 />,
        children: [
          {
            index: true,
            element: <Signup />
          }
        ]
      }
    ]
  }
]);
// render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
