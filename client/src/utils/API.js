// API.js file is used to make requests to the server
// the configuration of the requests is done here and the requests are exported to be used in other files
// Defining the functions that will make the requests to the server to get the data from the database will require establishing the routes to the server as shown in the fetch requests below and the method used to make the request.


// Route to get logged in user's info (needs the token)
const getUserTimeZone = () => localStorage.getItem("user_tz") || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';


// Build Headers Helper Function -  to include user timezone in all requests if available
const buildHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { authorization: `Bearer ${token}` } : {}),
  'x-user-timezone': getUserTimeZone(),
});
// route to get logged in user's info (needs the token)
export const getMe = (token) => {
  return fetch("/api/users/me", {
    headers: buildHeaders(token),
  });
};

// route to register a user
export const createUser = (userData) => {
  return fetch("/api/users", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(userData),
  });
};

// route to login a user
export const loginUser = (userData) => {
  return fetch("/api/users/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(userData),
  });
};

// route to book an appointment
export const createBooking = async (formData, token) => {
  const response = await fetch("/api/booking", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(formData),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ...data };
};

// route to get all bookings
export const getAllBookings = async (token) => {
  const response = await fetch("/api/booking", {
    headers: buildHeaders(token),
  });
  return response.json();
};

// Route to update a booking by its ID
export const updateBooking = async (bookingId, userData, token) => {
  const response = await fetch(`/api/booking/${bookingId}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(userData),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ...data };
};
// Route to delete a booking by its ID
export const deleteBooking = async (bookingId, token) => {
  const response = await fetch(`/api/booking/${bookingId}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem("id_token", result.token);
  }
};

// Exported Helper Function to get availability for a specific date
export const getAvailability = async (date) => {
  const response = await fetch(`/api/availability?date=${date}`, {
    headers: buildHeaders(),
  });
  return response.json();
};