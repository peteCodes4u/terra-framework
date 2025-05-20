import {
  Container,
  Navbar,
  Nav,
  Form,
  FormControl,
  Row,
  Col,
  Button,
} from "react-bootstrap";
// React icons that display social media icons and links
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

import React from "react";

const AppFooter = () => {
  return (
    <Navbar bg="dark" variant="dark" className="mt-4">
      <Container fluid>
        <Row className="w-100 align-items-center">
          <Col xs={12} md={4} className="mb-3 mb-md-0">
            <Form className="d-flex">
              <FormControl
                type="search"
                placeholder="Search"
                className="mr-2"
                aria-label="Search"
              />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Col>
          <Col xs={12} md={4} className="text-center text-md-right text-light">
            <div className="mb-2">
              <Nav className="d-flex justify-content-center justify-content-md-end">
                <Nav.Link href="https://facebook.com" target="_blank">
                  <FaFacebook />
                </Nav.Link>
                <Nav.Link href="https://twitter.com" target="_blank">
                  <FaTwitter />
                </Nav.Link>
                <Nav.Link href="https://instagram.com" target="_blank">
                  <FaInstagram />
                </Nav.Link>
              </Nav>
            </div>
            <div>
              &copy; {new Date().getFullYear()} Terra API Framework. All rights
              reserved.
            </div>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};

export default AppFooter;
