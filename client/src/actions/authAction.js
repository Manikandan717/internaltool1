import { Auth } from 'aws-amplify';  // Import Amplify Auth module
import setAuthToken from 'utils/setAuthToken';
import jwt_decode from 'jwt-decode';
import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING } from './types';
import axios from 'axios';

// Action to register a user
export const registerUser = (userData) => (dispatch) => {
  axios.post('user/register', userData)
    .then((res) => window.location = '/authentication/sign-in')
    .catch((err) => dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    }));
};

// Action to log in a user
export const loginUser = (userData) => (dispatch) => {
  axios.post('user/login', userData)
    .then(async (res) => {
      // Save to localStorage
      const { signInUserSession } = await Auth.currentAuthenticatedUser();
      const accessToken = signInUserSession.accessToken.jwtToken;
      
      localStorage.setItem('jwtToken', accessToken);
      // Set token to Auth header
      setAuthToken(accessToken);
      // Decode token to get user data
      const decoded = jwt_decode(accessToken);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) => dispatch({
      type: GET_ERRORS,
      payload: err.response.data
    }));
};

// Action to set the logged-in user
export const setCurrentUser = (decoded) => ({
  type: SET_CURRENT_USER,
  payload: decoded
});

// Action to set user loading
export const setUserLoading = () => ({
  type: USER_LOADING
});

// Action to log out a user
export const logoutUser = () => async (dispatch) => {
  try {
    // Sign out the user using Amplify Auth
    await Auth.signOut();
    
    // Remove token from local storage
    localStorage.removeItem('jwtToken');
    // Remove auth header for future requests
    setAuthToken(false);
    // Set current user to empty object {} which will set isAuthenticated to false
    dispatch(setCurrentUser({}));
  } catch (error) {
    console.error('Error signing out:', error);
  }
};


// import setAuthToken from 'utils/setAuthToken';
// import jwt_decode from 'jwt-decode';
// import {GET_ERRORS,SET_CURRENT_USER,USER_LOADING} from  './types';
// import axios from 'axios';


// export const registerUser = (userData) => dispatch =>{
//     axios.post('user/register',userData)
//     .then(res=> window.location = '/authentication/sign-in')
//     .catch(err=>dispatch(
//         {
//             type: GET_ERRORS,
//             payload: err.response.data
//         }
//     ));
// };

// export const loginUser = userData => dispatch => {
//     axios
//     .post('user/login', userData)
//     .then(res=>{
//          // Save to localStorage
  
//         // Set token to localStorage
//         const { token }  = res.data;
//         localStorage.setItem("jwtToken", token);
//         // Set token to Auth header
//         setAuthToken(token);
//         // Decode token to get user data
//         const decoded = jwt_decode(token);
//         // Set current user
//         dispatch(setCurrentUser(decoded));
//     })
//     .catch(err =>
//         dispatch({
//           type: GET_ERRORS,
//           payload: err.response.data
//         })
//       );
// }

//  // Set logged in user
//  export const setCurrentUser = decoded => {
//     return {
//       type: SET_CURRENT_USER,
//       payload: decoded
//     };
//   };

//   // User loading
//   export const setUserLoading = () => {
//     return {
//       type: USER_LOADING
//     };
//   };

//    // Log user out
//    export const logoutUser = () => dispatch => {
//     // Remove token from local storage
//     localStorage.removeItem("jwtToken");
//     // Remove auth header for future requests
//     setAuthToken(false);
//     // Set current user to empty object {} which will set isAuthenticated to false
//     dispatch(setCurrentUser({}));
//   };