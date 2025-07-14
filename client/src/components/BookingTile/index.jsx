
// Function that formats time from 24-hour to 12-hour format
function formatTime24to12(time24) {
    if (!time24) return 'N/A';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const convert = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${hour}:${minute} ${convert}`;
}
// Export function that renders a booking tile when a booking is created
export default function BookingTile({ booking }) {
    if (!booking) {
        return <div className="booking-tile">No booking data available.</div>;
    }
    return (
        <div className="booking-tile">
            <p>Date: {booking.date}</p>
            <p>Time: {formatTime24to12(booking.time)}</p>
        </div>
    );
}