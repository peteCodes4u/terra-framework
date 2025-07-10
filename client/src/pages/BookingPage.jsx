import BookingForm from '../components/BookingForm';
import BookingTile from '../components/BookingTile';
import { useStyle } from '../StyleContext';
export default function BookingPage() {
  const { activeStyle } = useStyle();
  return (
    <div className={`${activeStyle}-booking-page`}>

      <h1>Booking Page</h1>
      <p>
        Please book your consultation with us and we will get back to you!
      </p>

      <BookingForm />
      <BookingTile />
    </div>
  );
}
