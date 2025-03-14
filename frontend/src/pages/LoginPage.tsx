import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset, getUserInfo } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../app/store";

import { CiAt, CiLock } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import Card from "../components/Container/Card";
import Header from "../components/Text/Header";
import Subtitle from "../components/Text/Subtitle";
import SecondaryButton from "../components/Button/SecondaryButton";
import IconInputField from "../components/Input/IconInputField";
import PasswordInputField from "../components/Input/PasswordInputField";
import PrimaryButton from "../components/Button/PrimaryButton";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { email, password } = formData;

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
    setIsLoading(true);

    const userData = {
      email,
      password,
    };
    dispatch(login(userData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
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
    <>
      <Card>
        <div className="flex flex-col items-center mb-6">
          <Header text="Sign In" />
          <Subtitle text="Please enter your credentials to access your account" />
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <IconInputField
            type="text"
            placeholder="Email or Username"
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
    </>
  );
};

export default LoginPage;
