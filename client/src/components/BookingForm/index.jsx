import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

// import { createBooking } from '../../utils/API';
// import Auth from '../../utils/auth';


export default function BookingForm() {
  // set form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });
  // set state for form validation
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  // handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Booking Created Successfully!');
    } else {
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="booking-form">
      <h2>Booking</h2>
      <Form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required onChange={handleChange} />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required onChange={handleChange} />

        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" required onChange={handleChange} />

        <label htmlFor="time">Time:</label>
        <input type="time" id="time" name="time" required onChange={handleChange} />

        <Button type="submit">Book Now</Button>
      </Form>
    </div>
  );
}
