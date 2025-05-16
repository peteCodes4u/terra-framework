import { useState } from "react";
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
              <NavDropdown title="Explore" id="explore-dropdown">
                <NavDropdown.Item as={Link} to="/">
                  Home
                </NavDropdown.Item>
                {!Auth.loggedIn() ? (
                  <>
                    <NavDropdown.Item onClick={() => setActiveForm('login')}>
                      Login
                    </NavDropdown.Item>
                    <NavDropdown.Item onClick={() => setActiveForm('signup')}>
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