// Import necessary packages
import React from "react";
import { useParams } from "react-router-dom";

// Bootstrap Components
// import {
//   Container,
//   add additional bootstrap components here when ready
//   Col,
//   Form,
//   Button,
//   Card,
//   Row
// } from "react-bootstrap";

const ProfilePage = () => {
  const { id } = useParams();

  return (
    <>
      <h1>Profile Page</h1>
      <p>Welcome to your profile page: {id}</p>
    </>
  );
};

export default ProfilePage;
