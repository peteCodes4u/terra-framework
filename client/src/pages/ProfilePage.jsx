// Import components to use on profile page after a user logins in
// import Navbar from "../components/Navbar";

// Bootstrap Components
import {
  Container,
  //   add additional bootstrap components here when ready
  //   Col,
  //   Form,
  //   Button,
  //   Card,
  //   Row
} from "react-bootstrap";

const ProfilePage = () => {
  return (
    <>
      <main className="p-2">
        <Container>
          <center>
            <h1 className="py-2">Your Profile </h1>
          </center>
        </Container>
      </main>
    </>
  );
};

export default ProfilePage;
