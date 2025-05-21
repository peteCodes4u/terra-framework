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

export default function AppFooter() {
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
                <Button type="submit" className="footer-search-btn">
                  Search
                </Button>
              </Form>
            </Col>
            <Col xs={12} md={4} className="footer-social-col">
              <div className="footer-social">
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
              <div className="footer-copyright">
                &copy; {new Date().getFullYear()} Terra API Framework. All rights
                reserved.
              </div>
            </Col>
          </Row>
        </Container>
      </Navbar>
    </footer>
  );
}
