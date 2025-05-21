import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown, Button } from "react-bootstrap";

import Auth from "../../utils/auth";
import "../../../src/AppStyle1.css";

// this is the navigation bar component
export default function NavigationBar({ toggleStylesheet }) {
  const location = useLocation();
  const isProfilePage = /^\/profile\/[^/]+$/.test(location.pathname);

  // Fetch the logged in user ID if it's available
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;

  return (
    <>
      <Navbar id="navbar" expand="lg" className="app-style1-navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            Terra API Framework
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" className="app-style1-toggle-btn" />
          <Navbar.Collapse id="navbar" className="app-style1-navbar-collapse">
            <Nav className="app-style1-nav ml-auto d-flex">
              <NavDropdown title="Explore" id="explore-dropdown" className="app-style1-dropdown">
                <NavDropdown.Item as={Link} to="/">
                  Home
                </NavDropdown.Item>
                {!Auth.loggedIn() ? (
                  <>
<<<<<<< HEAD
                    <NavDropdown.Item onClick={() => setActiveForm("login")}>
                      Login
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => setActiveForm("signup")}>
=======
                    <NavDropdown.Item as={Link} to="/login">
                      Login
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/signup">
>>>>>>> c34999a (Changes completed to route to /login and /signup)
                      Signup
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to={`/profile/${userId}`}>
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={Auth.logout}>
                      Logout
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to={`/booking`}>
                      Booking
                    </NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
              {isProfilePage && (
                <Button
                  className="app-style1-toggle-theme-btn"
                  onClick={toggleStylesheet}
                >
                  Toggle Theme
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
<<<<<<< HEAD
      {/* Render forms below the navbar in custom popup dialogue */}
      {(activeForm === "login" || activeForm === "signup") && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-window">
            {activeForm === "login" && (
              <LoginForm handleModalClose={() => setActiveForm(null)} />
            )}
            {activeForm == "signup" && (
              <SignUpForm handleModalClose={() => setActiveForm(null)} />
            )}
          </div>
        </div>
      )}
=======
>>>>>>> c34999a (Changes completed to route to /login and /signup)
    </>
  );
}
