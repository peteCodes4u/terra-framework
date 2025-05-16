// Import necessary packages
import { useParams } from "react-router-dom";

export default function ProfilePage({ toggleStylesheet }) {
  const { id } = useParams();

  return (
    <>
      <h1>Profile Page</h1>
      <p>Welcome to your profile page: {id}</p>
    </>
  );
};
