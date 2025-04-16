import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset, getUserInfo } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../app/store";

import { CiAt, CiLock } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { Card } from "../components/Container";
import { Header, Subtitle } from "../components/Typography";
import { PrimaryButton, SecondaryButton } from "../components/Button";
import { IconInputField, PasswordInputField } from "../components/Input";

/**
 * LoginPage Component
 *
 * Handles user authentication by providing a login form with email and password fields.
 * Manages form state, submission process, and redirects based on auth status.
 */
const LoginPage = () => {
  // Form state management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get authentication state from Redux store
  const { user, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  /**
   * Updates form state when input values change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Handles form submission and dispatches login action
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      email,
      password,
    };
    dispatch(login(userData));
  };

  /**
   * Side effect to handle authentication results
   * - Shows error notifications
   * - Redirects on successful login
   * - Resets auth state after handling
   */
  useEffect(() => {
    if (isError) {
      toast.error(message, { theme: "dark" });
      setIsLoading(false);
    }

    if (isSuccess && user) {
      navigate("/");
      dispatch(getUserInfo());
    }

    dispatch(reset());
    setIsLoading(false);
  }, [isError, isSuccess, user, navigate, dispatch, message]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <div className="flex flex-col items-center mb-6">
          <Header text="Sign In" />
          <Subtitle text="Please enter your credentials to access your account" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <IconInputField
            type="text"
            placeholder="Email"
            name="email"
            onChange={handleChange}
            value={email}
            required
            autoFocus={true}
            icon={<CiAt className="h-5 w-5 text-gray-400" />}
          />
          <PasswordInputField
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={password}
            required
            icon={<CiLock className="h-5 w-5 text-gray-400" />}
          />
          <div className="flex justify-end mt-4">
            <p className="text-sm text-gray-400">
              <NavLink
                className="text-[#c549d4] hover:text-[#b23abc] font-medium"
                to="/reset-password"
              >
                Forgot Password?
              </NavLink>
            </p>
          </div>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Log In"
            )}
          </PrimaryButton>
          <div className="relative flex items-center mt-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <SecondaryButton type="button" onClick={() => navigate("/register")}>
            Create Account
          </SecondaryButton>
          <SecondaryButton
            type="button"
            className="bg-transparent hover:bg-transparent"
            onClick={() => navigate("/")}
          >
            Continue as Guest
          </SecondaryButton>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
