import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/index";

const initialState = {};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

export default store;
