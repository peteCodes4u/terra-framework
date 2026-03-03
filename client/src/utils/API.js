// API.js file is used to make requests to the server
// the configuration of the requests is done here and the requests are exported to be used in other files
// Defining the functions that will make the requests to the server to get the data from the database will require establishing the routes to the server as shown in the fetch requests below and the method used to make the request.


// Route to get logged in user's info (needs the token)
const getUserTimeZone = () => localStorage.getItem("user_tz") || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';


// Build Headers Helper Function
const builderHeaders = (token) => ({
  "Content-Type": "application/json",
  ...token(token ? { authorization: `Bearer ${token}` } : {}),
  'x-user-timezone': getUserTimeZone(),
});
// route to get logged in user's info (needs the token)
export const getMe = (token) => {
  return fetch("/api/users/me", {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
};

// route to register a user
export const createUser = (userData) => {
  return fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

// route to login a user
export const loginUser = (userData) => {
  return fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

// route to book an appointment
export const createBooking = async (formData, token) => {
  const response = await fetch("/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ...data };
};

// route to get all bookings
export const getAllBookings = async (token) => {
  const response = await fetch("/api/booking", {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Route to update a booking by its ID
export const updateBooking = async (bookingId, userData, token) => {
  const response = await fetch(`/api/booking/${bookingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ...data };
};
// Route to delete a booking by its ID
export const deleteBooking = async (bookingId, token) => {
  const response = await fetch(`/api/booking/${bookingId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem("id_token", result.token);
  }
};
