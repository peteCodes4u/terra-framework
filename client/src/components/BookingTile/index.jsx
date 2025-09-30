import { formatInTimeZone } from 'date-fns-tz';
import Button from 'react-bootstrap/Button';
import { useStyle } from '../../StyleContext';
import calendarData from '../../../../server/calendarData.json';

const orgTZ = calendarData.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

// Format ISO date string to 12-hour time
function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  // const date = new Date(dateStr);
  // const hours = date.getHours();
  // const minutes = date.getMinutes();
  // const ampm = hours >= 12 ? 'PM' : 'AM';
  // const hour12 = hours % 12 || 12;
  // const minuteStr = minutes.toString().padStart(2, '0');
  return formatInTimeZone(dateStr, orgTZ, 'h:mm a');
}

// Format ISO date string to Month Day, Year
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return formatInTimeZone(dateStr, orgTZ, 'MMMM d, yyyy');
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
