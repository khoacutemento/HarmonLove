import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import accountSlice from "./slices/accountSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    account: accountSlice,
  },
});

export default store;
