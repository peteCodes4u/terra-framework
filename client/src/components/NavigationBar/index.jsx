import { Link, useLocation } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap";

import Auth from "../../utils/auth";
import "../../../src/AppStyle1.css"

// this is the navigation bar component
export default function NavigationBar({ isStyle1Active, setIsStyle1Active }) {
  const location = useLocation();
  const isProfilePage = /^\/profile\/[^/]+$/.test(location.pathname);
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;

  return (
    <>
      <Navbar id="navbar" expand="lg" className={isStyle1Active ? "app-style1-navbar" : "app-style2-navbar"}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            Terra API Framework
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" className={isStyle1Active ? "app-style1-toggle-btn" : "app-style2-toggle-btn"} />
          <Navbar.Collapse id="navbar" className={isStyle1Active ? "app-style1-navbar-collapse" : "app-style2-navbar-collapse"}>
            <Nav className={isStyle1Active ? "app-style1-nav ml-auto d-flex" : "app-style2-nav ml-auto d-flex"}>
              <NavDropdown title="Explore" id="explore-dropdown" className={isStyle1Active ? "app-style1-dropdown" : "app-style2-dropdown"}>
                <NavDropdown.Item as={Link} to="/">Home</NavDropdown.Item>
                {!Auth.loggedIn() ? (
                  <>
                    <NavDropdown.Item as={Link} to="/login">Login</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/signup">Signup</NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to={`/profile/${userId}`}>Profile</NavDropdown.Item>
                    <NavDropdown.Item onClick={Auth.logout}>Logout</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
              {isProfilePage && (
                <NavDropdown title="Theme" id="theme-dropdown" className="ms-2">
                  <NavDropdown.Item
                    active={isStyle1Active}
                    onClick={() => setIsStyle1Active(true)}
                  >
                    Style 1
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    active={!isStyle1Active}
                    onClick={() => setIsStyle1Active(false)}
                  >
                    Style 2
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};