import axios from 'axios';
import { showAlert } from './alert';
const LOCALHOST = '127.0.0.1';
const PORT = 9000;

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://${LOCALHOST}:${PORT}/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    console.log('hitting logout ');
    const res = await axios({
      method: 'POST',
      url: `http://${LOCALHOST}:${PORT}/api/v1/users/logout`,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!');
      window.setTimeout(() => {
        location.reload(true);
        // location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Please try again.');
  }
};
