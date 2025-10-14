import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useStyle } from "../../StyleContext";
import { parseISO, addMinutes, format } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from "date-fns-tz";
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
  const callLengthMinutes = calendarData.callLengthMinutes || 30;

  // --- Form state ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    slotIso: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // --- Modal state ---
  const [updatedForm, setUpdatedForm] = useState({ ...formData });
  const [modalSlots, setModalSlots] = useState([]);

  // --- slot fetch ---
  const fetchSlots = async (orgDateStr, setSlots) => {
    if (!orgDateStr) return setSlots([]);
    try {
      const res = await fetch(`/api/availability?date=${orgDateStr}`);
      const data = await res.json();

      // --- LOG for verification ---
      // console.group(`AVAILABILITY DEBUG → ${orgDateStr}`);
      // console.log("Available slots (raw UTC):", data.availableTimes);
      // console.log(
      //   "Available slots (orgTZ view):",
      //   data.availableTimes.map(s => formatInTimeZone(parseISO(s), orgTZ, "yyyy-MM-dd HH:mm:ss"))
      // );
      // console.log(
      //   "Available slots (userTZ view):",
      //   data.availableTimes.map(s => formatInTimeZone(parseISO(s), userTZ, "yyyy-MM-dd HH:mm:ss"))
      // );
      // console.log("Unavailable slots:", data.unavailableTimes);
      // console.groupEnd();

      setSlots(data.availableTimes || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      setSlots([]);
    }
  };

  // --- Handle input changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm((prev) => ({ ...prev, [name]: value }));
  };

  // hydrate modal with user data
  useEffect(() => {
    if (showModal) {
      setUpdatedForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        date: initialData.date?.slice(0, 10) || "",
        slotIso: initialData.slotIso || "",
      });
    }
  }, [showModal, initialData]);

  // --- Hook: main form date → org date mapping ---
  useEffect(() => {
    if (!formData.date) {
      setAvailableSlots([]);
      return;
    }

    // --- Diagnostic tool for debugging ---
    // const userDateStart = new Date(`${formData.date}T00:00:00`);
    // const orgDateStart = utcToZonedTime(userDateStart, orgTZ);
    // const orgDateStr = format(orgDateStart, "yyyy-MM-dd");
    // console.log(`orgDateString: ${ orgDateStr }, userDateStart: ${userDateStart}, orgDateStart: ${orgDateStr}`);
    // console.group("TZ DEBUG - Main Form");
    // console.log("User selected date:", formData.date);
    // console.log("userTZ:", userTZ, "orgTZ:", orgTZ);

    // fetch slots based on user time
    fetchSlots(formData.date, setAvailableSlots);


    // Reset selected slot
    setFormData((prev) => ({ ...prev, slotIso: "" }));
  }, [formData.date]);

  // --- Hook: modal form date mapping ---
  useEffect(() => {
    if (!updatedForm.date) {
      setModalSlots([]);
      return;
    }

    // --- Diagnostic tools ---
    // const userDateStart = new Date(`${updatedForm.date}T00:00:00`);
    // const orgDateStart = utcToZonedTime(userDateStart, orgTZ);
    // const orgDateStr = format(orgDateStart, "yyyy-MM-dd");
    // console.log(`returned from modal: { orgDateStr: ${ orgDateStr }, userDateStart: ${userDateStart}, orgDateStart: ${orgDateStart} }`);
    // console.group("TZ DEBUG - Modal Form");
    // console.log("Modal user-selected date:", updatedForm.date);

    // fetch slots based on user time
    fetchSlots(updatedForm.date, setModalSlots);

    // Reset modal slot selection
    setUpdatedForm((prev) => ({ ...prev, slotIso: "" }));
  }, [updatedForm.date]);

  // --- Render slots in user TZ ---
  const renderSlotOptions = (slots) =>
    slots.map((slot) => {
      const userView = formatInTimeZone(parseISO(slot), userTZ, "h:mm a");
      return (
        <option key={slot} value={slot}>
          {userView}
        </option>
      );
    });

  // --- Build payload for API ---
  const createPayload = (data, original = {}) => ({
    ...original,
    name: data.name ?? original?.name,
    email: data.email ?? original?.email,
    phoneNumber: data.phoneNumber ?? original?.phoneNumber,
    date: data.date,
    slotIso: data.slotIso,
    start: data.slotIso,
    end: data.slotIso
      ? addMinutes(parseISO(data.slotIso), callLengthMinutes).toISOString()
      : undefined,
    _id: original?._id,
  });

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
              disabled={!formData.date || availableSlots.length === 0}
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
                disabled={!updatedForm.date || modalSlots.length === 0}
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
