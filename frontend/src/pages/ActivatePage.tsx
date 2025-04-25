import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { activate, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../app/store";

import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryIconButton } from "../components/Button";

import { CiCircleCheck } from "react-icons/ci";

/**
 * Account activation page component
 * @returns {JSX.Element} The rendered ActivatePage component
 */
const ActivatePage = () => {
  const { uid, token } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  /**
   * Handles the form submission for account activation
   * @param {React.MouseEvent<HTMLButtonElement>} e - The click event
   */
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const userData = {
      uid,
      token,
    };
    dispatch(activate(userData));
  };

  /**
   * Effect hook to handle side effects based on authentication state changes
   * Shows appropriate toast notifications and redirects on success
   */
  useEffect(() => {
    if (isError) {
      toast.error(message, { theme: "dark" });
    }

    if (isSuccess) {
      toast.success("Your account has been activated! You can login now", {
        theme: "dark",
      });
      navigate("/login");
    }

    dispatch(reset());
  }, [isError, isSuccess, navigate, dispatch, message]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <div className="flex flex-col items-center mb-6">
          <Header text="Activate Account" />
          <SecondaryText
            text="Press the button below to activate your account."
            className="text-gray-400 mb-4 mt-4"
          />
          <PrimaryIconButton
            type="button"
            icon={<CiCircleCheck className="h-4 w-4" />}
            onClick={handleSubmit}
          >
            Activate Account
          </PrimaryIconButton>
        </div>
      </Card>
    </div>
  );
};

export default ActivatePage;
