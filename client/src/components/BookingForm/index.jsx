import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { createBooking } from '../../utils/API';
import { getAllBookings } from '../../utils/API';
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
  const [bookings, setBookings] = useState([]);

  // handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // fetch all bookings when user creates a booking
  const fetchBookings = async () => {
    try {
      const token = Auth.getToken();
      const response = await getAllBookings(token);
      if (!response.ok) throw new Error('Failed to get bookings');
      const data = await response.json();
      setBookings(data);
      // error handling with message
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []); // Empty dependency array to run only once on mount

  // set state for form validation outside of handler to prevent React Infinite Loop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });
  // Removed redundant handleChange function
  // handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    try {
      const response = await createBooking(formData);
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

  return (
    <div className="booking-form">
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
      {/* Map function used to render all bookings list, we want to render only the bookings that the user chooses */}
      <div>
        {(Array.isArray(bookings) ? bookings : []).map((b, idx) => (
          <div key={b?._id || (b?.date && b?.time ? b.date + b.time : idx)}>
            <p>Date: {b?.date || 'N/A'} </p>
            <p>Time: {b?.time || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>

  );
}