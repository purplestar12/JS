import 'core-js/stable';
import 'regenerator-runtime';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

//DOM
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const saveUserData = document.querySelector('.form-user-data');
const saveUserPassword = document.querySelector('.form-user-password');

//VALUE

// DELEGATE THE TASK
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) {
  console.log('listening');
  logoutBtn.addEventListener('click', logout);
}

if (saveUserData) {
  saveUserData.addEventListener('submit', (e) => {
    e.preventDefault();

    //browser API constructs form data, so that text fields & files can be sent to the server using multipart/form-data
    const form = new FormData(); //recreate multipart/form-data

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (saveUserPassword) {
  saveUserPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updateSettings(
      { currentPassword, newPassword, confirmPassword },
      'password',
    );
    document.querySelector('.btn-save-password').textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
