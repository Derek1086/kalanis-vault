import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset, getUserInfo } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../app/store";
//import Spinner from "../components/Spinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
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
      password,
    };
    dispatch(login(userData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user) {
      navigate("/");
      // Don't call getUserInfo() until we're sure the user is logged in
      dispatch(getUserInfo());
    }

    dispatch(reset());
  }, [isError, isSuccess, user, navigate, dispatch, message]);

  return (
    <>
      <div className="container auth__container">
        <h1 className="main__title">Login</h1>

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
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
            value={password}
            required
          />
          <Link to="/reset-password">Forgot Password?</Link>

          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
