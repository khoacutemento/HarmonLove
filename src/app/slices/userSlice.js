import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userName: "",
  password: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  avatarUrl: "",
  weight: 30,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;
    },
    updateUserDetails: (state, action) => {
      state.weight = action.payload.weight;
      state.gender = action.payload.gender;
      state.dateOfBirth = action.payload.dateOfBirth;
    },
    setCredentials: (state, action) => {
      state.userName = action.payload.userName;
      state.password = action.payload.password;
    },
    clearUser: () => initialState,
  },
});

export const { setUserData, clearUser, updateUserDetails, setCredentials } =
  userSlice.actions;
export default userSlice.reducer;
