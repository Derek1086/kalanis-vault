import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { resetPasswordConfirm, reset } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "../app/store";

import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PasswordInputField } from "../components/Input";
import { PrimaryButton } from "../components/Button";

import { CiLock } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ResetPasswordPageConfirm = () => {
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({
    new_password: "",
    re_new_password: "",
  });

  const { new_password, re_new_password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    console.log(formData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (new_password !== re_new_password) {
      toast.error("Passwords do not match", { theme: "dark" });
      return;
    }

    const userData = {
      uid,
      token,
      new_password,
      re_new_password,
    };

    dispatch(resetPasswordConfirm(userData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message, { theme: "dark" });
    }
    if (isSuccess) {
      toast.success("Your password was reset successfully.", { theme: "dark" });
      navigate("/login");
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  return (
    <>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Header text="Reset Password" className="text-center" />
          <SecondaryText
            text="Create a new password."
            className="text-gray-400 mb-6 mt-4 text-center"
          />
          <PasswordInputField
            name="new_password"
            placeholder="New Password"
            onChange={handleChange}
            value={new_password}
            required
            icon={<CiLock className="h-5 w-5 text-gray-400" />}
          />
          <PasswordInputField
            name="re_new_password"
            placeholder="Confirm Password"
            onChange={handleChange}
            value={re_new_password}
            required
            icon={<CiLock className="h-5 w-5 text-gray-400" />}
          />

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Reset Password"
            )}
          </PrimaryButton>
        </form>
      </Card>
    </>
  );
};

export default ResetPasswordPageConfirm;
