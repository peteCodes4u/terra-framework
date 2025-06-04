// Import necessary packages
import { useParams } from "react-router-dom";
import { useStyle } from "../StyleContext";
import BookingForm from "../components/BookingForm";

export default function ProfilePage({ toggleStylesheet}) {
  const { id } = useParams();
  const { activeStyle } = useStyle();

  return (
  
    <div className={`${activeStyle}-profile-page`}>
      <h1>🛸 Welcome to your Profile Page! 🛸</h1>
      <p>your userId is: {id}</p>
      <BookingForm />
      <p>Feel free to book a consultation with us!</p>
      </div>
    
  );
};