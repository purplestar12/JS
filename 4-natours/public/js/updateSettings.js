import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:9000/api/v1/users/updateMe'
        : 'http://127.0.0.1:9000/api/v1/users/updateMyPassword';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log('res.data.status: ', res.data.status);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      if (type === 'data') {
        window.setTimeout(() => {
          location.reload(true);
        }, 5000);
      }
    }
  } catch (err) {
    showAlert('error', 'Error updating details. Please check the details!');
  }
};
