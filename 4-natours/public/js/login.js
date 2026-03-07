// import dotenv from 'dotenv';

// dotenv.config({ path: '/config.env' });

// const LOCALHOST = process.env.LOCALHOST;
// const PORT = process.env.PORT;

const LOCALHOST = '127.0.0.1';
const PORT = 9000;

const login = async (email, password) => {
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

document.querySelector('.form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
