import { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import BookingTile from '../components/BookingTile';
import { getAllBookings, createBooking, deleteBooking, updateBooking } from '../utils/API'
import Auth from '../utils/auth';
import { useStyle } from '../StyleContext';

export default function BookingPage() {
  const { activeStyle } = useStyle();
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  const fetchBookings = async () => {
    const token = Auth.getToken();
    if (!token) return;
    const response = await getAllBookings(token);
    if (!response.ok) return;
    const data = await response.json();
    setBookings(data);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCreateBooking = async (formData) => {
    const token = Auth.getToken();
    const response = await createBooking(formData, token);
    if (response.ok) fetchBookings();
    return response;
  };

  const handleDeleteBooking = async (id) => {
    const token = Auth.getToken();
    await deleteBooking(id, token);
    fetchBookings();
  };

  const handleUpdateBooking = async (id, updatedData) => {
    const token = Auth.getToken();
    const response = await updateBooking(id, updatedData, token);
    if (response.ok) fetchBookings();
    return response;
  };

  const handleUpdate = (id, booking) => {
    setBookingToEdit(booking);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setBookingToEdit(null);
  };

  const handleModalSubmit = async (updatedData) => {
    if (bookingToEdit && bookingToEdit._id) {
      return await handleUpdateBooking(bookingToEdit._id, updatedData);
    }
    setShowModal(false);
    setBookingToEdit(null);
  };

  return (
    <section className={`${activeStyle}-booking`}>
      <div className={`${activeStyle}-booking-page-header`}>
        <h2>Book an Appointment</h2>
        <h2>Your Bookings</h2>
      </div>
      <div className={`${activeStyle}-booking-feature`}>
        <BookingForm
          onBookingCreated={handleCreateBooking}
          showModal={showModal}
          onClose={handleModalClose}
          initialData={bookingToEdit}
          onBookingUpdated={handleModalSubmit}
        />
        <div className={`${activeStyle}-booking-records-container`}>
          {bookings.map(b => (
            <BookingTile
              key={b._id}
              booking={b}
              onDelete={handleDeleteBooking}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
