import { Link, useLocation } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap";

import Auth from "../../utils/auth";
import StyleToggler from "../StyleToggler";

// this is the navigation bar component
export default function NavigationBar({ activeStyle, setActiveStyle }) {
  const location = useLocation();
  const isProfilePage = /^\/profile\/[^/]+$/.test(location.pathname);
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;

  return (
    <Navbar id="navbar" expand="lg" className={`${activeStyle}-navbar`}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className={`${activeStyle}-brand`}>
          Terra API Framework
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar" className={`${activeStyle}-toggle-btn`} />
        <Navbar.Collapse id="navbar" className={`${activeStyle}-navbar-collapse`}>
          <Nav className={`${activeStyle}-nav ml-auto d-flex`}>
            <NavDropdown title="Explore" id="explore-dropdown" className={`${activeStyle}-dropdown`}>
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
              <StyleToggler
                activeStyle={activeStyle}
                setActiveStyle={setActiveStyle}
              />
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};