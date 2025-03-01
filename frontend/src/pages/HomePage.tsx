import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../features/auth/authSlice.ts";
import { AppDispatch, RootState } from "../app/store.tsx";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        {user ? (
          <>
            <NavLink className="nav-childs" to="/login" onClick={handleLogout}>
              Logout
            </NavLink>
            <div>
              <h1>Welcome, {userInfo.first_name} </h1>
            </div>
          </>
        ) : (
          <>Home</>
        )}
      </ul>
    </nav>
  );
};

export default HomePage;
