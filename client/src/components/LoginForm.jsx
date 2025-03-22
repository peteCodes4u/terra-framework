// see SignupForm.js for comments
import { useState } from "react";
import { Form, Button, Alert, Dropdown } from "react-bootstrap";
// This useHistory hook allows us to redirect the user to a different page in this case their profile page
import { useNavigate } from "react-router-dom";

import { loginUser } from "../utils/API";
import Auth from "../utils/auth";

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: "", password: "" });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  // Track login in status for future dropdown menu to be displayed after user logs in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Track user ID when they are logged in
  const [userId, setUserId] = useState(null);

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
      console.log(user);
      Auth.login(token);

      // Update login state
      setIsLoggedIn(true);
      setUserId(user._id);
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
    <>
      {/* Add logic to add drop down menu when user is logged in */}
      {!isLoggedIn ? (
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
            disabled={!(userFormData.email && userFormData.password)}
            type="submit"
            variant="success"
          >
            Submit
          </Button>
        </Form>
      ) : (
        // Drop down menu that will display when user is logged in
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Account
          </Dropdown.Toggle>

          <Dropdown.Menu>
            `
            <Dropdown.Item onClick={() => navigate(`/profile/${userId}`)}>
              Your Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => Auth.logout()}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </>
  );
};

export default LoginForm;
