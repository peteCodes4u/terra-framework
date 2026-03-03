import { useState } from 'react';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';
import Button from 'react-bootstrap/Button';
import { useStyle } from '../../StyleContext';
import calendarData from '../../../../server/calendarData.json'
import Auth from '../../utils/auth';

// Get organization time zone from calendar data
const orgTZ = calendarData.timeZone;

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

// format time for org comparison
function formatTimeOrg(dateStr) {
  if (!dateStr) return 'N/A';
  return formatInTimeZone(dateStr, orgTZ, 'h:mm a');
}

// format date for org comparison
function formatDateOrg(dateStr) {
  if (!dateStr) return 'N/A';
  return formatInTimeZone(dateStr, orgTZ, 'MMMM d, yyyy');
}



// Render a booking tile
export default function BookingTile({ booking, onDelete, onUpdate }) {

  // style context
  const { activeStyle } = useStyle();

  // expand additional details effect
  const [showDetails, setShowDetails] = useState(false);

  // Determine if booking is past (based on orgTZ)
  const nowOrg = utcToZonedTime(new Date(), orgTZ);
  const bookingEndOrg = utcToZonedTime(booking.end, orgTZ);
  const bookingStartOrg = utcToZonedTime(booking.start, orgTZ);
  const isPast = bookingEndOrg < nowOrg || bookingStartOrg < nowOrg;

  return (
    <section className={`${activeStyle}-booking-tile`}>
      <div className={`${activeStyle}-booking-tile-info`}>
        <p>Contact: {booking.name}</p>
        <p>Email: {booking.email}</p>
        <p>Phone: {booking.phoneNumber}</p>
        <p>Local Date: {formatDate(booking.start)}</p>
        <p>
          Local Time: {formatTime(booking.start)} - {formatTime(booking.end)}
        </p>

        <Button
          variant="link"
          style={{ padding: 0, fontSize: '0.8em' }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'hide additional details ▲' : 'show additional details ▼'}
        </Button>

        {showDetails && (
          <div>
            <p>----</p>
            <p className="text-muted" style={{ fontSize: '0.7em' }}>
              Please join the meeting at your local time shown above.
              The organization's time may appear different depending on your location, but both times refer to the same meeting.
            </p>
            <p>---</p>
            <p className="text-muted" style={{ fontSize: '0.7em' }}>
              This office is located in: {orgTZ}
            </p>
            <p className="text-muted" style={{ fontSize: '0.7em' }}>
              Your appointment in {orgTZ} is on {formatDateOrg(booking.start)} at{' '}
              {formatTimeOrg(booking.start)} - {formatTimeOrg(booking.end)}
            </p>
          </div>
        )}
      </div>

      <div className={`${activeStyle}-booking-tile-buttons`}>
        {!isPast && (
          <Button variant="primary" onClick={() => onUpdate && onUpdate(booking._id, booking)}>
            Update
          </Button>
        )}
        <Button variant="danger" onClick={() => onDelete && onDelete(booking._id)}>
          {isPast ? 'Remove Past Appointment' : 'Cancel'}
        </Button>
      </div>
    </section>
  );
}