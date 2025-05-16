import BookingForm from "../components/BookingForm";

export default function BookingPage() {
  return (
    <>
      <h1>Booking Page</h1>
      <p>Booking: {booking}</p>
      <form>
        <BookingForm />
      </form>
    </>
  );
}
