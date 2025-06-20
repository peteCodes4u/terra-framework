import BookingForm from '../components/BookingForm';
import BookingTile from '../components/BookingTile';
export default function BookingPage() {
  return (
    <>
      <h1>Booking Page</h1>
      <br />
      <h4>
        Please book your consultation with us and we will get back to you!
      </h4>
      <br />
      <BookingForm />
      <BookingTile />
    </>
  );
}
