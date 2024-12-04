// react components
// import { useState, useEffect } from 'react';

// Bootstrap Components
import {
  Container,
  Card,
  Col,
  Row,
  //   add additional bootstrap components here when ready
  //   Form,
  //   Button,

  //   Row
} from "react-bootstrap";

const PageOne = () => {
  return (
    <>
      <main className="py-2">
        <Container className="text-center">
          <h1 className="py-2">Terra Framework </h1>
          <Row className="py-4">
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Forms</Card.Title>
                  <Card.Text>
                    This image or gif could be clickable to link to a new page
                    that goes into detail about how to leverage this solution
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>User Interface</Card.Title>
                  <Card.Text>
                    This could be an image of the code and an image or gif of
                    the actual solution
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Database solutions</Card.Title>
                  <Card.Text>
                    We could also include links in the navbar to these solutions
                    as well
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default PageOne;
