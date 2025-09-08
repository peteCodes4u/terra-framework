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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [updatedForm, setUpdatedForm] = useState({
    date: '',
    time: ''
  });
  const [modalAvailableTimes, setModalAvailableTimes] = useState([]);
  const [loadingModalTimes, setLoadingModalTimes] = useState(false);

  // Initialize updated form for modal
  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.date) {
        const d = new Date(initialData.date);
        formattedDate = !isNaN(d) ? d.toISOString().slice(0, 10) : initialData.date;
      }
      setUpdatedForm({ date: formattedDate, time: initialData.time || '' });
    }
  }, [initialData]);

  // Fetch available times for new booking
  useEffect(() => {
    if (!formData.date) {
      setAvailableTimes([]);
      return;
    }

    setLoadingTimes(true);
    fetch(`/api/availability?date=${formData.date}`)
      .then(res => res.json())
      .then(data => setAvailableTimes(data.availableTimes || []))
      .catch(err => {
        console.error("Failed to fetch availability:", err);
        setAvailableTimes([]);
      })
      .finally(() => setLoadingTimes(false));
  }, [formData.date]);

  // Fetch available times for update modal
  useEffect(() => {
    if (!updatedForm.date) {
      setModalAvailableTimes([]);
      return;
    }

    setLoadingModalTimes(true);
    fetch(`/api/availability?date=${updatedForm.date}`)
      .then(res => res.json())
      .then(data => setModalAvailableTimes(data.availableTimes || []))
      .catch(err => {
        console.error("Failed to fetch modal availability:", err);
        setModalAvailableTimes([]);
      })
      .finally(() => setLoadingModalTimes(false));
  }, [updatedForm.date]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min slot

    const payload = {
      name: formData.name,
      email: formData.email,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      date: formData.date, // YYYY-MM-DD
    };

    onBookingCreated(payload);

    setFormData({ name: '', email: '', date: '', time: '' });
  };


const handleModalSubmit = (e) => {
  e.preventDefault();

  if (onBookingUpdated) {
    const startDate = new Date(`${updatedForm.date}T${updatedForm.time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    onBookingUpdated({
      ...initialData,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      date: updatedForm.date,
    });
  }

  if (onClose) onClose();
  setUpdatedForm({ date: '', time: '' });
};

  return (
    <>
      {/* New Booking Form */}
      <Form className={`${activeStyle}-booking-form`} onSubmit={handleSubmit}>
        <div className={`${activeStyle}-form-container`}>
          <div className={`${activeStyle}-form-group`}>
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
          <div className={`${activeStyle}-form-group`}>
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
          <div className={`${activeStyle}-form-group`}>
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
          <div className={`${activeStyle}-form-group`}>
            <label htmlFor="time">Time:</label>
            {loadingTimes ? (
              <p>Loading available times...</p>
            ) : (
              <select
                id="time"
                name="time"
                required
                value={formData.time}
                onChange={handleInputChange}
                disabled={!formData.date || availableTimes.length === 0}
              >
                <option value="">Select a time</option>
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            )}
          </div>
          <Button type="submit" disabled={!formData.date || !formData.time}>
            Book Now
          </Button>
        </div>
      </Form>

      {/* Update Booking Modal */}
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
              {loadingModalTimes ? (
                <p>Loading available times...</p>
              ) : (
                <Form.Control
                  as="select"
                  name="time"
                  value={updatedForm.time}
                  onChange={handleModalInputChange}
                  disabled={!updatedForm.date || modalAvailableTimes.length === 0}
                >
                  <option value="">Select a time</option>
                  {modalAvailableTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </Form.Control>
              )}
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!updatedForm.date || !updatedForm.time}>
              Update Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
