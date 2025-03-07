import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { useNavigate, NavLink } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";

import { CiMail, CiUser, CiLock } from "react-icons/ci";

import Card from "../components/Container/Card";
import Header from "../components/Text/Header";
import Subtitle from "../components/Text/Subtitle";
import SecondaryText from "../components/Text/SecondaryText";
import InputField from "../components/Input/InputField";
import IconInputField from "../components/Input/IconInputField";
import PasswordInputField from "../components/Input/PasswordInputField";
import PrimaryButton from "../components/Button/PrimaryButton";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    re_password: "",
  });

  const { first_name, last_name, username, email, password, re_password } =
    formData;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isError, isSuccess, message } = useSelector(
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
    } else if (!username) {
      toast.error("Username is required"); // Validate username
    } else {
      const userData = {
        first_name,
        last_name,
        username, // Include username in user data
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
      <Card>
        <div className="flex flex-col items-center mb-6">
          <Header text="Create Account" />
          <Subtitle text="Please fill in your information to get started" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <InputField
              type={"text"}
              placeholder={"First Name"}
              name={"first_name"}
              onChange={handleChange}
              value={first_name}
              required
            />
            <InputField
              type={"text"}
              placeholder={"Last Name"}
              name={"last_name"}
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
          <PrimaryButton type="submit">Sign Up</PrimaryButton>
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
    </>
  );
};

export default RegisterPage;
