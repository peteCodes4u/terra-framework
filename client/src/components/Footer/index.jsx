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
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const AppFooter = () => {
  return (
    <footer className="app-style1-footer">
      <Navbar className="footer-navbar">
        <Container fluid>
          <Row className="w-100 align-items-center">
            <Col xs={12} md={4}>
              <Form className="d-flex footer-search">
                <FormControl
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <Button variant="outline-success" type="submit" className="footer-search-btn">
                  Search
                </Button>
              </Form>
            </Col>
            <Col xs={12} md={8} className="footer-right d-flex align-items-center justify-content-end">
              <div className="footer-social d-flex align-items-center">
                <Nav className="d-flex">
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
                <span className="footer-copyright ms-3">
                  &copy; {new Date().getFullYear()} Terra API Framework. All rights reserved.
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </Navbar>
    </footer>
  );
}
