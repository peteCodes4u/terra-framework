import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import { loginUser } from "../../utils/API";
import Auth from "../../utils/auth";

const LoginForm = ({ handleModalClose, activeStyle }) => {
  const [userFormData, setUserFormData] = useState({ email: "", password: "" });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const response = await loginUser(userFormData);

      if (!response.ok) {
        throw new Error("something went wrong!");
      }

      const { token, user } = await response.json();
      Auth.login(token);

    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className={`${activeStyle}-popup-window`}>
      <div className={`${activeStyle}-popup-header d-flex align-items-center justify-content-between mb-3`}>
        <h4 className="mb-0">Login</h4>
        {typeof handleModalClose === "function" && (
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleModalClose}
          ></button>
        )}
      </div>
      <div className={`${activeStyle}-popup-body`}>
        <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
          <Alert
            dismissible
            onClose={() => setShowAlert(false)}
            show={showAlert}
            variant="danger"
          >
            Something went wrong with your login credentials!
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="email">Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your email"
              name="email"
              onChange={handleInputChange}
              value={userFormData.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              Email is required!
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Your password"
              name="password"
              onChange={handleInputChange}
              value={userFormData.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              Password is required!
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            className="mb-0"
            disabled={!(userFormData.email && userFormData.password)}
            type="submit"
            variant="success"
          >
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
