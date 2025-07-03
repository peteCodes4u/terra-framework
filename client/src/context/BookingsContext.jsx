import { createContext, useContext, useState } from "react";
// We are defining a context for bookings that can be used throughout the application.
const BookingsContext = createContext();

// This hook allows components to access the bookings context easily.
export function useBookings() {
    return useContext(BookingsContext);
}
// This provider component wraps around the part of the app that needs access to bookings data.
// It manages the state of bookings and provides a way to update it.
export function BookingsProvider({ children }) {
    const [bookings, setBookings] = useState([]);
    return (
        <BookingsContext.Provider value={{ bookings, setBookings }}>
            {children}
        </BookingsContext.Provider>
    );
}