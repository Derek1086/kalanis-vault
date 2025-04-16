import axios from "axios";
import { BACKEND_DOMAIN } from "../../types/playlists";

const REGISTER_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/`;
const LOGIN_URL = `${BACKEND_DOMAIN}/api/v1/auth/jwt/create/`;
const ACTIVATE_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/activation/`;
const RESET_PASSWORD_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/reset_password/`;
const RESET_PASSWORD_CONFIRM_URL = `${BACKEND_DOMAIN}/api/v1/auth/users/reset_password_confirm/`;
const GET_USER_INFO = `${BACKEND_DOMAIN}/api/v1/auth/users/me/`;

/**
 * Service for user registration
 * @param userData - Object containing user registration data
 * @returns Promise with response data
 */
const register = async (userData: any) => {
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const response = await axios.post(REGISTER_URL, userData, config);

  return response.data;
};

/**
 * Service for user authentication
 * @param userData - Object containing email and password
 * @returns Promise with response data including JWT tokens
 */
const login = async (userData: { email: string; password: string }) => {
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  console.log(userData);

  const response = await axios.post(LOGIN_URL, userData, config);

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

/**
 * Service to handle user logout
 * Removes user data from local storage
 */
const logout = () => {
  return localStorage.removeItem("user");
};

/**
 * Service to activate user account
 * @param userData - Object containing activation token
 * @returns Promise with response data
 */
const activate = async (userData: any) => {
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const response = await axios.post(ACTIVATE_URL, userData, config);

  return response.data;
};

/**
 * Service to initiate password reset process
 * @param userData - Object containing email
 * @returns Promise with response data
 */
const resetPassword = async (userData: any) => {
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const response = await axios.post(RESET_PASSWORD_URL, userData, config);

  return response.data;
};

/**
 * Service to confirm password reset
 * @param userData - Object containing reset token and new password
 * @returns Promise with response data
 */
const resetPasswordConfirm = async (userData: any) => {
  const config = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const response = await axios.post(
    RESET_PASSWORD_CONFIRM_URL,
    userData,
    config
  );

  return response.data;
};

/**
 * Service to get authenticated user information
 * @param accessToken - JWT access token
 * @returns Promise with user data
 */
const getUserInfo = async (accessToken: any) => {
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await axios.get(GET_USER_INFO, config);

  return response.data;
};

const authService = {
  register,
  login,
  logout,
  activate,
  resetPassword,
  resetPasswordConfirm,
  getUserInfo,
};

export default authService;
