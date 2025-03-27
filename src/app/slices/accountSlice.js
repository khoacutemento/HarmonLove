import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { SERVER_URL } from "../../constants";

export const fetchAccount = createAsyncThunk(
  "account/fetchAccount",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SERVER_URL}/user/account/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Lỗi khi lấy thông tin tài khoản",
      );
    }
  },
);

export const updateAccount = createAsyncThunk(
  "account/updateAccount",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/users/${updatedData.id}`,
        updatedData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Lỗi khi cập nhật tài khoản",
      );
    }
  },
);

const initialState = {
  id: null,
  role: null,
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  duration: 0,
  avatarUrl: "",
  userInfo: null,
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    //   .addCase(updateAccount.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(updateAccount.fulfilled, (state, action) => {
    //     state.loading = false;
    //     Object.assign(state, action.payload);
    //   })
    //   .addCase(updateAccount.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });
  },
});

export const { logout } = accountSlice.actions;
export default accountSlice.reducer;
