import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'
import ErrorPage from "../src/pages/ErrorPage"
import Home from "../src/pages/Home";

const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          path:"/",
          element: <Home />
        }, 
      ]
    }
  ])
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
  )