import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useStyle } from "../../StyleContext";
import { parseISO, format } from "date-fns";

export default function BookingForm({
  onBookingCreated,
  showModal = false,
  onClose,
  initialData = {},
  onBookingUpdated,
}) {
  const today = new Date();
  const { activeStyle } = useStyle();

  // === Form state ===
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    time: "",
  });
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // === Modal state ===
  const [updatedForm, setUpdatedForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    time: "",
  });
  const [modalAvailableTimes, setModalAvailableTimes] = useState([]);
  const [loadingModalTimes, setLoadingModalTimes] = useState(false);

  // === Initialize modal form with initialData ===
  useEffect(() => {
    if (initialData?.date) {
      const formattedDate = new Date(initialData.date)
        .toISOString()
        .slice(0, 10);
      setUpdatedForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        date: formattedDate,
        time: initialData.time || "",
      });

    }
  }, [initialData]);

  // === Fetch available times for main form ===
  useEffect(() => {
    if (!formData.date) {
      setAvailableTimes([]);
      return;
    }
    setLoadingTimes(true);
    fetch(`/api/availability?date=${formData.date}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableTimes(data.availableTimes || []);
      })
      .catch((err) => {
        console.error("Failed to fetch availability:", err);
        setAvailableTimes([]);
      })
      .finally(() => setLoadingTimes(false));
  }, [formData.date]);

  // === Fetch available times for modal form ===
  useEffect(() => {
    if (!updatedForm.date) {
      setModalAvailableTimes([]);
      return;
    }
    setLoadingModalTimes(true);
    fetch(`/api/availability?date=${updatedForm.date}`)
      .then((res) => res.json())
      .then((data) => {
        setModalAvailableTimes(data.availableTimes || []);
      })
      .catch((err) => {
        console.error("Failed to fetch modal availability:", err);
        setModalAvailableTimes([]);
      })
      .finally(() => setLoadingModalTimes(false));
  }, [updatedForm.date]);

  // === Handlers ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm((prev) => ({ ...prev, [name]: value }));
  };

  // === Submit for new booking ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDate = new Date(`${formData.date}T${formData.time}`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const payload = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      date: formData.date,
    };

    try {
      // Call API and get the response
      const response = await onBookingCreated(payload);

      // when the backend sends a new token, update localStorage
      if(response && response.token) {
        localStorage.setItem("id_token", response.token);
      }

      if (response && response.status === 400) {
        // Conflict error from backend
        setErrorMessage("We're Sorry, you just missed it, While you were deciding, someone else just booked this time slot, please select a new time and try again thank you!");
        setShowErrorModal(true);
        return;
      }
      setErrorMessage("");
      setAvailableTimes((prev) => prev.filter((time) => time !== formData.time));
      fetch(`/api/availability?date=${formData.date}`)
        .then((res) => res.json())
        .then((data) => setAvailableTimes(data.availableTimes || []))
        .catch((err) => console.error("Failed to refresh availability:", err));
      setFormData({ name: "", email: "", phoneNumber: "", date: formData.date, time: "" });
    } catch (err) {
      setErrorMessage("Failed to create booking. Please try again.");
    }
  };

  // === Submit for modal update ===
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (!onBookingUpdated) return;
    
    // Use the original time if the user did not change it
    const timeToUse = updatedForm.time || (initialData.time || format(new Date(initialData.start), "HH:mm"));
    const dateToUse = updatedForm.date;

    const startDate = new Date(`${dateToUse}T${timeToUse}`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    try {
      const response = await onBookingUpdated({
        _id: initialData._id,
        name: updatedForm.name,
        email: updatedForm.email,
        phoneNumber: updatedForm.phoneNumber,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        date: updatedForm.date,
      });

      // when the backend sends a new token, update localStorage
      if(response && response.token) {
        localStorage.setItem("id_token", response.token);
      }

      // Check for conflict error (status 400)
      if (response && response.status === 400) {
        setErrorMessage("We're Sorry, you just missed it, While you were deciding, someone else just booked this time slot, please select a new time and try again thank you!");
        setShowErrorModal(true);
        return;
      }

      // Success: reset modal state and close
      setErrorMessage("");
      setModalAvailableTimes((prev) =>
        prev.filter((time) => time !== updatedForm.time)
      );
      fetch(`/api/availability?date=${updatedForm.date}`)
        .then((res) => res.json())
        .then((data) => setModalAvailableTimes(data.availableTimes || []))
        .catch((err) => console.error("Failed to refresh modal availability:", err));
      setUpdatedForm({ date: updatedForm.date, time: "" });
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage("Failed to update booking. Please try again.");
      setShowErrorModal(true);
    }
  };

function isUpdateEnabled() {
  const safeInitial = initialData || {};
  return (
    updatedForm.name !== (safeInitial.name || "") ||
    updatedForm.email !== (safeInitial.email || "") ||
    updatedForm.phoneNumber !== (safeInitial.phoneNumber || "") ||
    updatedForm.date !== (safeInitial.date ? safeInitial.date.slice(0, 10) : "") ||
    updatedForm.time !== (safeInitial.time || "")
  );
}

  // === Render ===
  return (
    <>
      {/* error pop up modal */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Booking Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{errorMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
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
            <label>Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              pattern="^\+?[1-9]\d{1,14}$"
              required
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+15551234567"
              onInvalid={(e) =>
                e.target.setCustomValidity("Please enter a valid phone number, e.g. +15551234567")
              }
              onInput={(e) => e.target.setCustomValidity("")}
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
                onClick={() => {
                  if (!formData.date) return;
                  fetch(`/api/availability?date=${formData.date}`)
                    .then((res) => res.json())
                    .then((data) => setAvailableTimes(data.availableTimes || []))
                    .catch((err) => console.error("Failed to refresh availability:", err));
                }}
                disabled={
                  !formData.date ||
                  availableTimes.length === 0 ||
                  formData.date === today.toISOString().slice(0, 10)
                }
              >
                <option value="">Select a time</option>
                {availableTimes.map((time) => {
                  const parsed = parseISO(`${formData.date}T${time}`);
                  return (
                    <option key={time} value={time}>
                      {format(parsed, "h:mm a")}
                    </option>
                  )
                })}
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
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updatedForm.name}
                onChange={handleModalInputChange}
              />
            </Form.Group>
            <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={updatedForm.email}
                  onChange={handleModalInputChange}
                />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control 
                type="tel"
                name="phoneNumber"
                value={updatedForm.phoneNumber}
                onChange={handleModalInputChange}
              />
            </Form.Group>
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
                  onClick={() => {
                    if (!updatedForm.date) return;
                    fetch(`/api/availability?date=${updatedForm.date}`)
                      .then((res) => res.json())
                      .then((data) => setModalAvailableTimes(data.availableTimes || []))
                      .catch((err) =>
                        console.error("Failed to refresh availability:", err)
                      );
                  }}
                  onChange={handleModalInputChange}
                  disabled={
                    !updatedForm.date ||
                    modalAvailableTimes.length === 0 ||
                    updatedForm.date === today.toISOString().slice(0, 10)
                  }
                >
                  <option value="">Select a time</option>
                  {modalAvailableTimes.map((time) => {
                    const parsed = parseISO(`${updatedForm.date}T${time}`);
                    return (
                      <option key={time} value={time}>
                        {format(parsed, "h:mm a")}
                      </option>
                    )
                  })}
                </Form.Control>
              )}
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={!isUpdateEnabled()}
            >
              Update Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
