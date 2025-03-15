import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Interface defining the User type
interface User {
  access?: string;
}

// Main state interface for the auth slice
interface AuthState {
  user: User | null;
  userInfo: any;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

// Initialize user from localStorage if available
const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;

const initialState: AuthState = {
  user: user ? user : null,
  userInfo: {},
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Interface for user registration data
interface RegisterUserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  re_password: string;
}

/**
 * Async thunk for user registration
 * Handles the API call and error handling for registration
 */
export const register = createAsyncThunk(
  "auth/register",
  async (userData: RegisterUserData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for user login
 * Manages authentication and token storage
 */
export const login = createAsyncThunk(
  "auth/login",
  async (userData: any, thunkAPI) => {
    try {
      console.log(userData);
      return await authService.login(userData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for user logout
 * Removes auth tokens and clears state
 */
export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
  return null;
});

/**
 * Async thunk for account activation
 * Used for email verification flow
 */
export const activate = createAsyncThunk(
  "auth/activate",
  async (userData: any, thunkAPI) => {
    try {
      return await authService.activate(userData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for password reset request
 * Initiates the password reset flow
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (userData: any, thunkAPI) => {
    try {
      return await authService.resetPassword(userData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for confirming password reset
 * Completes the password reset flow with the token and new password
 */
export const resetPasswordConfirm = createAsyncThunk(
  "auth/resetPasswordConfirm",
  async (userData: any, thunkAPI) => {
    try {
      return await authService.resetPasswordConfirm(userData);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async thunk for fetching user information
 * Uses the access token from state to authenticate the request
 */
export const getUserInfo = createAsyncThunk(
  "auth/getUserInfo",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const accessToken = state.auth.user?.access;
      return await authService.getUserInfo(accessToken);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Main auth slice containing reducers and handling async thunk actions
 * Manages the authentication state throughout the application
 */
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Registration state handlers
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      // Login state handlers
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      // Logout handler
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      // Activation state handlers
      .addCase(activate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(activate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(activate.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      // Password reset state handlers
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      // Password reset confirmation state handlers
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      })
      // User info handler
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;

export default authSlice.reducer;
