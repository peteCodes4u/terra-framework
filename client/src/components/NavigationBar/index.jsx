import { act, useState } from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Button,
} from "react-bootstrap";

import SignUpForm from '../SignUpForm';
import LoginForm from "../LoginForm";
import Auth from "../../utils/auth";
import "./Popup.css";

// this is the navigation bar component
export default function NavigationBar({ toggleStylesheet }) { 

  // State to control form visibility(Login/ Signup/ etc)
  const [ activeForm, setActiveForm ] = useState(null) //'login', 'signup', 'null'

  // Fetch the logged in user ID if it's available
  const userId = Auth.loggedIn() ? Auth.getProfile().data._id : null;

  return (
    <>
      <Navbar id="navbar" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            Terra API Framework
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar" className="d-flex flex-row-reverse">
            <Nav className="ml-auto d-flex">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              {/* if user is logged in show the dropdown menu */}
              {Auth.loggedIn() ? (
                <NavDropdown title="Account" id="account-dropdown">
                  <NavDropdown.Item as={Link} to={`/profile/${userId}`}>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={Auth.logout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                <Nav.Link onClick={() => setActiveForm('login')}>
                  Login
                </Nav.Link>
                <Nav.Link onClick={() => setActiveForm('signup')}>
                  Signup
                </Nav.Link>
                </>
              )}
              <Button
                variant="outline-light"
                className="ml-2"
                onClick={toggleStylesheet}
              >
                Toggle Theme
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* Render forms below the navbar in custom popup dialogue */}
      {(activeForm === 'login' || activeForm === 'signup') && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-window">
            <button className="custom-popup-close" onClick={() => setActiveForm(null)}>
            X
            </button>
            {activeForm === 'login' && (
              <LoginForm handleModalClose={() => setActiveForm(null)}/>
            )}
            {activeForm == 'signup' && (
              <SignUpForm handleModalClose = {() => setActiveForm(null)}/>
            )}
          </div>
        </div>
      )}
    </>
  );
};