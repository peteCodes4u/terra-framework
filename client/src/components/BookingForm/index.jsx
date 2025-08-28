import { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { createBooking, getAllBookings, deleteBooking, updateBooking } from '../../utils/API';
import { useStyle } from '../../StyleContext';
import BookingTile from '../BookingTile';
import Auth from '../../utils/auth';

/**
 * BookingForm Component
 * This component renders a form for users to book an appointment.
 * It includes fields for name, email, date, and time, and handles form submission
 * by sending the data to the server. It also provides validation and error handling.
 */
export default function BookingForm() {

  // set state for booking and bookings
  const [booking, setBooking] = useState(null);
  const { activeStyle } = useStyle();
  // set state for form validation outside of handler to prevent React Infinite Loop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });

  // set state for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatedForm, setUpdatedForm] = useState({
    Date: "",
    Time: ""
  });



  // fetch all bookings when user creates a booking
  const fetchBookings = async () => {
    try {
      const token = Auth.getToken();
      if (!token) {
        console.warn("No token found, not fetching bookings.");
        return; // Don't fetch if not logged in
      }
      const response = await getAllBookings(token);
      if (!response.ok) throw new Error('Failed to get bookings');
      const data = await response.json();
      setBooking(data);
      // error handling with message
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  // Handler to delete a booking
  const handleDeleteBooking = async (bookingId) => {
    const token = Auth.getToken();
    await deleteBooking(bookingId, token);
    fetchBookings(); // Refresh bookings after deletion
  };

  // Handler to update a booking
  const handleUpdateBooking = async (bookingId) => {
    const appointmentToUpdate = booking.find(b => b._id === bookingId);
    setSelectedAppointment(appointmentToUpdate);
    setUpdatedForm({ date: appointmentToUpdate.date, time: appointmentToUpdate.time });
    setShowModal(true);
  };

  // Handle modal input changes
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm(prev => ({ ...prev, [name]: value }));
  };
  // Submit update from modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const token = Auth.getToken();
    await updateBooking(selectedAppointment._id, updatedForm, token);
    setShowModal(false);
    setSelectedAppointment(null);
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []); // Empty dependency array to run only once on mount

  // handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Removed redundant handleChange function
  // handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = Auth.getToken();
    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    try {
      const response = await createBooking(formData, token);
      if (!response.ok) throw new Error("Booking failed");
      const data = await response.json();
      setBooking(data.booking || data);
      // Reset the form fields after successful submission
      setFormData({ name: '', email: '', date: '', time: '' });
      await fetchBookings(); // Refresh bookings after creating a new one
      alert("Booking successful!");
    } catch (err) {
      alert("Booking failed! Please try again.");
    }
  };


  // Render the booking form
  return (
    <div className="booking-form-container">
      <div className="booking-form-left">
        {/* {errorMessage && <Alert variant="danger">{errorMessage}</Alert>} */}
        <Form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />

          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input
              type="time"
              id="time"
              name="time"
              required
              value={formData.time}
              onChange={handleInputChange}
            />
            <Button type="submit">Book Now</Button>
          </div>

        </Form>
      </div>
      {/* Map function used to render all bookings list, we want to render only the bookings that the user chooses */}
      <div className={`${activeStyle}-booking-tile booking-form-right`}>
        <h2 style={{ marginBottom: '1rem', color: '#0d6efd' }}>Your Bookings</h2>

        {/* Map function used to render all bookings with delete and update handlers */}
        {booking && booking.length > 0 && booking.filter(b => b && b.date && b.time) // filters only valid bookings
          .map((b) => (
            <BookingTile key={b._id} booking={b} onDelete={handleDeleteBooking} onUpdate={handleUpdateBooking} />
          ))}
      </div>

      {/* Update Modal */}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleModalSubmit}>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={updatedForm.date}
                onChange={handleModalInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formTime">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={updatedForm.time}
                onChange={handleModalInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Update Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>

  );
};