import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Modal,
  Tab,
  NavDropdown,
} from "react-bootstrap";
import SignUpForm from "./SignupForm";
import LoginForm from "./LoginForm";

import Auth from "../utils/auth";

const AppNavbar = () => {
  // set modal display state
  const [showModal, setShowModal] = useState(false);

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
                Terra API Framework
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
                <Nav.Link onClick={() => setShowModal(true)}>
                  Login/Sign Up
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {/* set modal data up */}
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby="signup-modal"
      >
        {/* tab container to do either signup or login component */}
        <Tab.Container defaultActiveKey="login">
          <Modal.Header closeButton>
            <Modal.Title id="signup-modal">
              <Nav variant="pills">
                <Nav.Item>
                  <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey="login">
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey="signup">
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;
