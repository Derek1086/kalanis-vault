import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store"; // Import your store types
//import Spinner from '../components/Spinner'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    re_password: "",
  });

  const { first_name, last_name, email, password, re_password } = formData;

  // Use the correctly typed dispatch
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

    if (password !== re_password) {
      toast.error("Passwords do not match");
    } else {
      const userData = {
        first_name,
        last_name,
        email,
        password,
        re_password,
      };
      dispatch(register(userData));
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/");
      toast.success(
        "An activation email has been sent to your email. Please check your email"
      );
    }

    dispatch(reset());
  }, [isError, isSuccess, user, navigate, dispatch, message]);

  return (
    <>
      <div className="container auth__container">
        <h1 className="main__title">Register</h1>

        {isLoading && <p>Loading...</p>}

        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            name="first_name"
            onChange={handleChange}
            value={first_name}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            name="last_name"
            onChange={handleChange}
            value={last_name}
            required
          />
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
          <input
            type="password"
            placeholder="Retype Password"
            name="re_password"
            onChange={handleChange}
            value={re_password}
            required
          />

          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
