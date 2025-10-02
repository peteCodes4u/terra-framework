import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useStyle } from "../../StyleContext";
import { parseISO, addMinutes, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import calendarData from "../../../../server/calendarData.json";

export default function BookingForm({
  onBookingCreated,
  onBookingUpdated,
  showModal = false,
  onClose,
  initialData = {},
}) {
  const { activeStyle } = useStyle();
  const orgTZ = calendarData.timeZone;
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // --- Form state ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    slotIso: "", // ISO-based slot
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // --- Modal form state ---
  const [updatedForm, setUpdatedForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    slotIso: "",
  });
  const [modalSlots, setModalSlots] = useState([]);
  const [loadingModalSlots, setLoadingModalSlots] = useState(false);

  const callLengthMinutes = calendarData.callLengthMinutes || 30;

  // --- Fetch slots for a date ---
  const fetchSlots = async (dateStr, setSlots) => {
    if (!dateStr) return setSlots([]);
    setSlots([]);
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      setSlots(data.availableTimes || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      setSlots([]);
    }
  };

  // --- Initialize modal form for updates ---
  useEffect(() => {
    if (initialData?.date) {
      setUpdatedForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        date: initialData.date?.slice(0, 10) || "",
        slotIso: initialData.slotIso || "",
      });
    }
  }, [initialData]);

  // --- Fetch available slots when date changes ---
  useEffect(() => {
    fetchSlots(formData.date, setAvailableSlots);
  }, [formData.date]);

  useEffect(() => {
    fetchSlots(updatedForm.date, setModalSlots);
  }, [updatedForm.date]);

  // --- Input handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Payload creation ---
  const createPayload = (data, original) => {
    const payload = {
      ...original,
      name: data.name ?? original?.name,
      email: data.email ?? original?.email,
      phoneNumber: data.phoneNumber ?? original?.phoneNumber,
      date: data.date,
      slotIso: data.slotIso,
      start: data.slotIso,
      end: data.slotIso ? addMinutes(parseISO(data.slotIso), callLengthMinutes).toISOString() : undefined,
      _id: original?._id,
    };
    return payload;
  };

  // --- Submit handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.slotIso) {
      setErrorMessage("Please select a valid date and time.");
      return setShowErrorModal(true);
    }
    try {
      const payload = createPayload(formData);
      const response = await onBookingCreated(payload);
      if (response?.status === 400 || response?.error) {
        setErrorMessage(response.message || "Conflict Error");
        return setShowErrorModal(true);
      }
      // Reset form
      setFormData({ name: "", email: "", phoneNumber: "", date: "", slotIso: "" });
      setAvailableSlots([]);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error creating booking.");
      setShowErrorModal(true);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const payload = createPayload(updatedForm, initialData);
    try {
      const response = await onBookingUpdated(payload);
      if (response?.status === 400 || response?.error) {
        setErrorMessage(response.message || "Conflict Error");
        return setShowErrorModal(true);
      }
      setModalSlots([]);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage("Error updating booking.");
      setShowErrorModal(true);
    }
  };

  // --- Render helper ---
  const renderSlotOptions = (slots) =>
    slots.map((slot) => {
      const readable = formatInTimeZone(parseISO(slot), userTZ, "h:mm a");
      return (
        <option key={slot} value={slot}>
          {readable}
        </option>
      );
    });

  // --- Modal update check ---
  const isUpdateEnabled = () => {
    const safeInitial = initialData || {};
    return (
      updatedForm.name !== (safeInitial.name || "") ||
      updatedForm.email !== (safeInitial.email || "") ||
      updatedForm.phoneNumber !== (safeInitial.phoneNumber || "") ||
      updatedForm.date !== (safeInitial.date?.slice(0, 10) || "") ||
      updatedForm.slotIso !== (safeInitial.slotIso || "")
    );
  };

  return (
    <>
      {/* Error Modal */}
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

      {/* Main Booking Form */}
      <Form className={`${activeStyle}-booking-form`} onSubmit={handleSubmit}>
        <div className={`${activeStyle}-form-container`}>
          <div className={`${activeStyle}-form-group`}>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className={`${activeStyle}-form-group`}>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className={`${activeStyle}-form-group`}>
            <label>Phone Number:</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
          </div>
          <div className={`${activeStyle}-form-group`}>
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className={`${activeStyle}-form-group`}>
            <label>Time:</label>
            <select
              name="slotIso"
              value={formData.slotIso}
              onChange={handleInputChange}
              disabled={!formData.date || loadingSlots || availableSlots.length === 0}
              required
            >
              <option value="">Select a time</option>
              {renderSlotOptions(availableSlots)}
            </select>
          </div>
          <Button type="submit" disabled={!formData.date || !formData.slotIso}>
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
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={updatedForm.name} onChange={handleModalInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={updatedForm.email} onChange={handleModalInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" name="phoneNumber" value={updatedForm.phoneNumber} onChange={handleModalInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" value={updatedForm.date} onChange={handleModalInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Time</Form.Label>
              <Form.Control
                as="select"
                name="slotIso"
                value={updatedForm.slotIso}
                onChange={handleModalInputChange}
                disabled={!updatedForm.date || loadingModalSlots || modalSlots.length === 0}
              >
                <option value="">Select a time</option>
                {renderSlotOptions(modalSlots)}
              </Form.Control>
            </Form.Group>
            <Button type="submit" disabled={!isUpdateEnabled()}>
              Update Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
