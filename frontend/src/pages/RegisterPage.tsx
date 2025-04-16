import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate, NavLink } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";

import { CiMail, CiUser, CiLock } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { Card } from "../components/Container";
import { Header, Subtitle, SecondaryText } from "../components/Typography";
import {
  InputField,
  IconInputField,
  PasswordInputField,
} from "../components/Input";
import { PrimaryButton } from "../components/Button";

/**
 * RegisterPage Component
 *
 * Handles new user registration with a form for account creation.
 * Validates form inputs, dispatches registration action, and handles responses.
 */
const RegisterPage = () => {
  // Form state with all required registration fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    re_password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { first_name, last_name, username, email, password, re_password } =
    formData;

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
   * Handles form submission with client-side validation
   * - Validates password match
   * - Ensures username is provided
   * - Dispatches register action if validation passes
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== re_password) {
      toast.error("Passwords do not match", { theme: "dark" });
      setIsLoading(false);
    } else if (!username) {
      toast.error("Username is required", { theme: "dark" });
      setIsLoading(false);
    } else {
      const userData = {
        first_name,
        last_name,
        username,
        email,
        password,
        re_password,
      };
      dispatch(register(userData));
    }
  };

  /**
   * Side effect to handle registration results
   * - Shows error notifications
   * - Redirects and shows success message on successful registration
   * - Resets auth state after handling
   */
  useEffect(() => {
    if (isError) {
      toast.error(message, { theme: "dark" });
      setIsLoading(false);
    }

    if (isSuccess || user) {
      navigate("/login");
      toast.success(
        "An activation email has been sent to your email. Please check your email.",
        { theme: "dark" }
      );
    }

    dispatch(reset());
    setIsLoading(false);
  }, [isError, isSuccess, user, navigate, dispatch, message]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <div className="flex flex-col items-center mb-6">
          <Header text="Create Account" />
          <Subtitle text="Please fill in your information to get started" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <InputField
              type="text"
              placeholder="First Name"
              name="first_name"
              onChange={handleChange}
              value={first_name}
              required
              autoFocus={true}
            />
            <InputField
              type="text"
              placeholder="Last Name"
              name="last_name"
              onChange={handleChange}
              value={last_name}
              required
            />
          </div>
          <IconInputField
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
            value={email}
            required
            icon={<CiMail className="h-5 w-5 text-gray-400" />}
          />
          <IconInputField
            type="text"
            placeholder="Username"
            name="username"
            onChange={handleChange}
            value={username}
            required
            icon={<CiUser className="h-5 w-5 text-gray-400" />}
          />
          <PasswordInputField
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={password}
            required
            icon={<CiLock className="h-5 w-5 text-gray-400" />}
          />
          <PasswordInputField
            name="re_password"
            placeholder="Confirm Password"
            onChange={handleChange}
            value={re_password}
            required
            icon={<CiLock className="h-5 w-5 text-gray-400" />}
          />
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Sign Up"
            )}
          </PrimaryButton>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              <SecondaryText
                text="Already have an account?"
                className="inline mr-2"
              />
              <NavLink
                className="text-[#c549d4] hover:text-[#b23abc] font-medium"
                to="/login"
              >
                Log In
              </NavLink>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
