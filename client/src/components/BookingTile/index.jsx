

// Export function that renders a booking tile when a booking is created
export default function BookingTile({ booking }) {
    if (!booking) {
        return <div className="booking-tile">No booking data available.</div>;
    }
    return (
        <div className="booking-tile">
            <h3>{booking.name}</h3>
            <p>Email: {booking.email}</p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
        </div>
    );
}