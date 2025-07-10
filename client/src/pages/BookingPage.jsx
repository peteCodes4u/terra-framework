import BookingForm from '../components/BookingForm';
import BookingTile from '../components/BookingTile';
import { useStyle } from '../StyleContext';
import { useBookings } from '../context/BookingsContext';
export default function BookingPage() {
  const { activeStyle } = useStyle();
  const { bookings } = useBookings();

  // Show the most recent booking if available
  const latestBooking = bookings && bookings.length > 0 ? bookings[bookings.length - 1] : null;
  return (
    <div className={`${activeStyle}-booking-page`}>

      <h1>Booking Page</h1>
      <p>
        Please book your consultation with us and we will get back to you!
      </p>

      <BookingForm />
      <BookingTile booking={latestBooking} />
    </div>
  );
}
