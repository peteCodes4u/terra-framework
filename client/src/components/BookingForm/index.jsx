import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { createBooking } from '../../utils/API';
import BookingTile from '../BookingTile';

/**
 * BookingForm Component
 * This component renders a form for users to book an appointment.
 * It includes fields for name, email, date, and time, and handles form submission
 * by sending the data to the server. It also provides validation and error handling.
 */
export default function BookingForm() {
  // set form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });
  // set state for booking
  const [booking, setBooking] = useState(null);
  const [validated] = useState(false);
  // const [errorMessage, setErrorMessage] = useState('');
  // handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // set state for form validation
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
      const data = await createBooking(formData);
      setBooking(data.booking || data);
    } catch (err) {
      alert("Booking failed! Please try again.");
    }
  };

  setFormData({
    name: '',
    email: '',
    date: '',
    time: ''
  });

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
        </div>
        <Button type="submit">Book Now</Button>
      </Form>
      {booking && <BookingTile booking={booking} />}
    </div>
  );
}
