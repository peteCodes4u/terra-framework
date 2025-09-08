import Button from 'react-bootstrap/Button';
import { useStyle } from '../../StyleContext';

// Format ISO date string to 12-hour time
function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${hour12}:${minuteStr} ${ampm}`;
}

// Format ISO date string to Month Day, Year
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Render a booking tile
export default function BookingTile({ booking, onDelete, onUpdate }) {
  const { activeStyle } = useStyle();

  return (
    <div className={`${activeStyle}-booking-tile`}>
      <p>Date: {formatDate(booking.start)}</p>
      <p>
        Time: {formatTime(booking.start)} - {formatTime(booking.end)}
      </p>
      <Button variant="primary" onClick={() => onUpdate && onUpdate(booking._id, booking)}>
        Update
      </Button>
      <Button variant="danger" onClick={() => onDelete && onDelete(booking._id)}>
        Cancel
      </Button>
    </div>
  );
}
