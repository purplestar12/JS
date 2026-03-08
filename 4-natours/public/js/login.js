import axios from 'axios';

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
      alert('Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};
