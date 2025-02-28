import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { activate, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../app/store";
//import Spinner from '../components/Spinner'

const ActivatePage = () => {
  const { uid, token } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const userData = {
      uid,
      token,
    };
    dispatch(activate(userData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success("Your account has been activated! You can login now");
      navigate("/login");
    }

    dispatch(reset());
  }, [isError, isSuccess, navigate, dispatch, message]);

  return (
    <div>
      <div className="container auth__container">
        <h1 className="main__title">Activate Account</h1>

        {isLoading && <p>Loading...</p>}

        <button
          className="btn btn-accent btn-activate-account"
          type="button"
          onClick={handleSubmit}
        >
          Activate Account
        </button>
      </div>
    </div>
  );
};

export default ActivatePage;
