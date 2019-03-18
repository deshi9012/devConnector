import axios from 'axios';

import { GET_ERRORS } from './types';

//Register User
export const registerUser = userData => async dispatch => {
  try {
    const result = await axios.post('api/users/register', userData);
  } catch (err) {
    return dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    });
  }
};
