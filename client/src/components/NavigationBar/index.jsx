import { Link, useLocation } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";

import Auth from "../../utils/auth";
import "../../../src/AppStyle1.css"

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
                    <NavDropdown.Item as={Link} to="/login">
                      Login
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/signup">
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
    </>
  );
};