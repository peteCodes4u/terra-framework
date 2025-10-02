import { formatInTimeZone } from 'date-fns-tz';
import Button from 'react-bootstrap/Button';
import { useStyle } from '../../StyleContext';

// Use browser-detected user time zone
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

// Format ISO date string to 12-hour time in user TZ
function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  return formatInTimeZone(dateStr, userTZ, 'h:mm a');
}

// Format ISO date string to Month Day, Year in user TZ
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return formatInTimeZone(dateStr, userTZ, 'MMMM d, yyyy');
}

// Render a booking tile
export default function BookingTile({ booking, onDelete, onUpdate }) {
  const { activeStyle } = useStyle();

  return (
    <section className={`${activeStyle}-booking-tile`}>
      <div className={`${activeStyle}-booking-tile-info`}>
        <p>Contact: {booking.name}</p>
        <p>Email: {booking.email}</p>
        <p>Phone: {booking.phoneNumber}</p>
        <p>Date: {formatDate(booking.start)}</p>
        <p>
          Time: {formatTime(booking.start)} - {formatTime(booking.end)}
        </p>
      </div>
      <div className={`${activeStyle}-booking-tile-buttons`}>
        <Button variant="primary" onClick={() => onUpdate && onUpdate(booking._id, booking)}>
          Update
        </Button>
        <Button variant="danger" onClick={() => onDelete && onDelete(booking._id)}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
