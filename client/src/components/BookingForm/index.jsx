import { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useStyle } from '../../StyleContext';

export default function BookingForm({
  onBookingCreated,
  showModal = false,
  onClose,
  initialData = {},
  onBookingUpdated

}) {
  const { activeStyle } = useStyle();

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.date) {
        const d = new Date(initialData.date);
        if (!isNaN(d)) {
          formattedDate = d.toISOString().slice(0, 10);
        } else {
          formattedDate = initialData.date;
        }
      }
      setUpdatedForm({
        date: formattedDate,
        time: initialData.time || ''
      });
    }
  }, [initialData]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });

    // Modal state for updating a booking
  const [updatedForm, setUpdatedForm] = useState({
    date: '',
    time: ''
  });

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    // Handle input changes for the modal form
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onBookingCreated(formData);
    setFormData({ name: '', email: '', date: '', time: '' });
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (onBookingUpdated) {
      onBookingUpdated({ ...initialData, ...updatedForm });
    }
    if (onClose) onClose();
    setUpdatedForm({ date: '', time: '' });
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
      {/* Update Modal */}

      <Modal show={showModal} onHide={onClose}>
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