import { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { useStyle } from "../../StyleContext";
import { parseISO, addMinutes, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import calendarData from "../../../../server/calendarData.json";

export default function BookingForm({
  onBookingCreated,
  showModal = false,
  onClose,
  initialData = {},
  onBookingUpdated,
}) {
  const { activeStyle } = useStyle();

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

  const [updatedForm, setUpdatedForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    date: "",
    time: "",
  });
  const [modalAvailableTimes, setModalAvailableTimes] = useState([]);
  const [loadingModalTimes, setLoadingModalTimes] = useState(false);

  const [callLengthMinutes, setCallLengthMinutes] = useState(
    calendarData.callLengthMinutes || 30
  );

  // === Load availability ===
  const fetchAvailability = async (dateStr, setTimes) => {
    if (!dateStr) return setTimes([]);
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (data.callLengthMinutes) setCallLengthMinutes(data.callLengthMinutes);
      setTimes(data.availableTimes || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      setTimes([]);
    }
  };

  // === Initialize modal form from initialData ===
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

  // === Main form availability ===
  useEffect(() => {
    setLoadingTimes(true);
    fetchAvailability(formData.date, setAvailableTimes).finally(() =>
      setLoadingTimes(false)
    );
  }, [formData.date]);

  // === Modal availability ===
  useEffect(() => {
    setLoadingModalTimes(true);
    fetchAvailability(updatedForm.date, setModalAvailableTimes).finally(() =>
      setLoadingModalTimes(false)
    );
  }, [updatedForm.date]);

  // === Input handlers ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedForm((prev) => ({ ...prev, [name]: value }));
  };

  // === Create payload helper ===
const createPayload = (data, original) => {
  const dateChanged = data.date && data.date !== original?.date?.slice(0, 10);
  const timeChanged = data.time && data.time !== original?.time;

  // If neither date nor time changed, return original start/end
  if (!dateChanged && !timeChanged) {
    return {
      ...original,
      name: data.name ?? original.name,
      email: data.email ?? original.email,
      phoneNumber: data.phoneNumber ?? original.phoneNumber,
    };
  }

  // Determine the final date/time
  const finalDate = data.date || original?.date?.slice(0, 10);
  const finalTime = data.time || original?.time;

  // Parse start ISO safely
  const startIso = finalTime ? parseISO(finalTime) : parseISO(original.time);
  const endIso = addMinutes(startIso, callLengthMinutes).toISOString();

  return {
    ...original,
    name: data.name ?? original.name,
    email: data.email ?? original.email,
    phoneNumber: data.phoneNumber ?? original.phoneNumber,
    date: finalDate,
    time: finalTime,
    slotIso: finalTime,
    start: startIso.toISOString(),
    end: endIso,
    _id: original?._id,
  };
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      setErrorMessage("Please select a valid date and time.");
      return setShowErrorModal(true);
    }
    try {
      const payload = createPayload(formData);
      const response = await onBookingCreated(payload);
      if (response?.status === 400 || response?.error === "Conflict") {
        setErrorMessage(response.message || "Conflict Error");
        return setShowErrorModal(true);
      }
      if (response?.status === 200) {
        setFormData({ name: "", email: "", phoneNumber: "", date: "", time: "" });
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error creating booking.");
      setShowErrorModal(true);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    // Only require time if date changed
    const dateChanged = updatedForm.date !== initialData.date?.slice(0, 10);
    if (dateChanged && !updatedForm.time) {
      setErrorMessage("Please select a valid time for the new date.");
      return setShowErrorModal(true);
    }

    try {
      const payload = createPayload(updatedForm, initialData);
      const response = await onBookingUpdated(payload);
      if (response?.status === 400 || response?.error === "Conflict") {
        setErrorMessage(response.message || "Conflict Error");
        return setShowErrorModal(true);
      }
      if (response?.status === 200) {
        setUpdatedForm({ name: "", email: "", phoneNumber: "", date: "", time: "" });
        setModalAvailableTimes([]);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error updating booking.");
      setShowErrorModal(true);
    }
  };

  // === Render helper for slot times ===
  const renderSlots = (slots) => {
    const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const orgTZ = calendarData.timeZone;
    const sameDayBookingPermitted = calendarData.sameDayBookingPermitted;
    const todayStr = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");

    // Use updatedForm.date if rendering modal slots
    const compareDate = slots === modalAvailableTimes ? updatedForm.date : formData.date;

    if (sameDayBookingPermitted === false && compareDate === todayStr) {
      return <option>Sameday booking is not permitted</option>;
    }

    return slots.map((slotIso) => {
      const rendered = formatInTimeZone(parseISO(slotIso), userTZ, "h:mm a");
      return (
        <option key={slotIso} value={slotIso}>
          {rendered}
        </option>
      );
    });
  };

  const isUpdateEnabled = () => {
    const safeInitial = initialData || {};
    return (
      updatedForm.name !== (safeInitial.name || "") ||
      updatedForm.email !== (safeInitial.email || "") ||
      updatedForm.phoneNumber !== (safeInitial.phoneNumber || "") ||
      updatedForm.date !== (safeInitial.date?.slice(0, 10) || "") ||
      updatedForm.time !== (safeInitial.time || "")
    );
  };

  return (
    <>
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

      {/* Main Form */}
      <Form className={`${activeStyle}-booking-form`} onSubmit={handleSubmit}>
        <div className={`${activeStyle}-form-container`}>
          <div className={`${activeStyle}-form-group`}>
            <label htmlFor="name">Name:</label>
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
            {loadingTimes ? <p>Loading...</p> : (
              <select name="time" value={formData.time} onChange={handleInputChange} required disabled={!formData.date || availableTimes.length === 0}>
                <option value="">Select a time</option>
                {renderSlots(availableTimes)}
              </select>
            )}
          </div>
          <Button type="submit" disabled={!formData.date || !formData.time}>Book Now</Button>
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
              {loadingModalTimes ? <p>Loading...</p> : (
                <Form.Control as="select" name="time" value={updatedForm.time} onChange={handleModalInputChange} disabled={!updatedForm.date || modalAvailableTimes.length === 0}>
                  <option value="">Select a time</option>
                  {renderSlots(modalAvailableTimes)}
                </Form.Control>
              )}
            </Form.Group>
            <Button type="submit" disabled={!isUpdateEnabled()}>Update Booking</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
