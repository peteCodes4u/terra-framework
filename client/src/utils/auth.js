// use this to decode a token and get the user's information out of it
import decode from "jwt-decode";
const TIMEZONE_KEY = "user_tz";
const TOKEN_KEY = "id_token";

// create a new class to instantiate for a user
class AuthService {
  // get user data
  getProfile() {
    return decode(this.getToken());
  }

  // check if user's logged in
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token); // hand waiving here
  }

  // check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem(TOKEN_KEY);
  }

  setTimeZone(timezone) {
    if (!timezone) return;
    localStorage.setItem(TIMEZONE_KEY, timezone);
  }
  getTimeZone() {
    const saved = localStorage.getItem(TIMEZONE_KEY);
    if (saved) return saved;
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }

  clearTimeZone() {
    localStorage.removeItem(TIMEZONE_KEY);
  }

  login(idToken) {
    // Saves user token to localStorage
    localStorage.setItem(TOKEN_KEY, idToken);
    // this will reload the page and reset the state of the application
    window.location.assign("/");
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem(TOKEN_KEY);
    this.clearTimeZone();
    // this will reload the page and reset the state of the application
    window.location.assign("/");
  }
}

export default new AuthService();
