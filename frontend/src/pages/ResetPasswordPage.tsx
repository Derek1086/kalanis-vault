import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
//import Spinner from "../components/Spinner"
import { resetPassword, reset } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "../app/store";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const { email } = formData;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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

    const userData = {
      email,
    };

    dispatch(resetPassword(userData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess) {
      toast.success("A reset password email has been sent to you.");
      navigate("/");
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  return (
    <>
      <div className="container auth__container">
        <h1 className="main__title">Reset Password</h1>

        {isLoading && <p>Loading...</p>}

        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
            value={email}
            required
          />

          <button className="btn btn-primary" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPage;
