import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, reset } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "../app/store";

import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryButton, SecondaryButton } from "../components/Button";
import { IconInputField } from "../components/Input";

import { CiAt } from "react-icons/ci";

/**
 * ResetPasswordPage Component
 *
 * @description A page component that allows users to request a password reset by submitting their email.
 * The component handles form submission, displays success/error messages via toast notifications,
 * and redirects users after successful submission.
 *
 * @component
 * @returns {JSX.Element} Rendered form for password reset request
 */
const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const { email } = formData;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  /**
   * Handles form input changes
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Handles form submission
   *
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      email,
    };

    dispatch(resetPassword(userData));
  };

  /**
   * Handles form submission
   *
   * @param {React.FormEvent} e - Form submission event
   */
  useEffect(() => {
    if (isError) {
      toast.error(message, { theme: "dark" });
    }
    if (isSuccess) {
      toast.success("A reset password email has been sent to you.", {
        theme: "dark",
      });
      navigate("/");
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Header text="Reset Password" className="text-center" />
          <SecondaryText
            text="Enter your email to reset your password."
            className="text-gray-400 mb-6 mt-4 text-center"
          />
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
          <PrimaryButton type="submit" disabled={false}>
            Reset Password
          </PrimaryButton>
        </form>

        <div className="text-center">
          <SecondaryButton onClick={() => navigate("/")}>
            Go Home
          </SecondaryButton>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
