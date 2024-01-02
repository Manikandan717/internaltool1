// authActions.js

import setAuthToken from 'utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from './types';
import axios from 'axios';

// Register user
export const registerUser = (userData) => (dispatch) => {
  axios
    .post('https://pblcs5okhkahpnmrbcmzwdpove0qepho.lambda-url.us-east-1.on.aws/register', userData)
    .then((res) => (window.location = '/authentication/sign-in'))
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Login user
export const loginUser = (userData) => (dispatch) => {
  axios
    .post('https://pblcs5okhkahpnmrbcmzwdpove0qepho.lambda-url.us-east-1.on.aws/user/login', userData)
    .then((res) => {
      // Save to localStorage
      const { token } = res.data;

      // Set token to localStorage
      localStorage.setItem('jwtToken', token);

      // Set token to Auth header
      setAuthToken(token);

      // Decode token to get user data
      const decoded = jwt_decode(token);

      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded, // adjust this based on your token structure
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};

// Log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem('jwtToken');

  // Remove auth header for future requests
  setAuthToken(false);

  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
