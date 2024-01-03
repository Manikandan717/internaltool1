// authActions.js

import setAuthToken from 'utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from './types';
import axios from 'axios';
<<<<<<< HEAD
 
const apiUrl = process.env.REACT_APP_API_URL;
export const registerUser = (userData) => dispatch =>{
    axios.post(`${apiUrl}/register`,userData)
    .then(res=> window.location = '/authentication/sign-in')
    .catch(err=>dispatch(
        {
            type: GET_ERRORS,
            payload: err.response.data
        }
    ));
};
 
export const loginUser = userData => dispatch => {
    axios
    .post(`${apiUrl}/login`, userData)
    .then(res=>{
         // Save to localStorage
 
        // Set token to localStorage
        const { token }  = res.data;
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        dispatch(setCurrentUser(decoded));
=======

// Register user
export const registerUser = (userData) => (dispatch) => {
  axios
    .post('/user/register', userData)
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
    .post('/user/login', userData)
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
>>>>>>> df4fa8ca7a229a055effc38fe2287e99ff4e361f
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
<<<<<<< HEAD
 
   // Log user out
   export const logoutUser = () => dispatch => {
    // Remove token from local storage
    localStorage.removeItem("jwtToken");
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to empty object {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}));
  };
=======
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
>>>>>>> df4fa8ca7a229a055effc38fe2287e99ff4e361f
