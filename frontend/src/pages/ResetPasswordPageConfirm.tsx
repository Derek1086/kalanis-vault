import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { resetPasswordConfirm, reset } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "../app/store";
//import Spinner from "../components/Spinner";

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (new_password !== re_new_password) {
      toast.error("Passwords do not match");
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
      toast.error(message);
    }
    if (isSuccess) {
      toast.success("Your password was reset successfully.");
      navigate("/login");
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  return (
    <>
      <div className="container auth__container">
        <h1 className="main__title">Reset Your Password</h1>

        {isLoading && <p>Loading...</p>}

        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            name="new_password"
            onChange={handleChange}
            value={new_password}
            required
            minLength={8}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            name="re_new_password"
            onChange={handleChange}
            value={re_new_password}
            required
            minLength={8}
          />
          <button className="btn btn-primary" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPageConfirm;
