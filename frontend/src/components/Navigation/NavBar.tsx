import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../app/store";
import { logout, reset } from "../../features/auth/authSlice";

import { CiBellOn, CiBoxList, CiUser } from "react-icons/ci";
import { IoHomeOutline, IoSearch } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";

import SearchField from "../Input/SearchField";
import IconButton from "../Button/IconButton";

const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-[#151316] shadow-md px-6 py-4">
      <div className="mx-[50px] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white">Kalani's Vault</span>
        </div>
        <div className="relative flex items-center flex-grow max-w-md">
          <SearchField
            type="text"
            placeholder="Search..."
            name="search"
            onChange={handleSearch}
            value={searchQuery}
            icon={<IoSearch className="h-5 w-5 text-gray-400" />}
            className="pr-20"
            onClear={() => setSearchQuery("")}
          />
          <div className="absolute right-10 h-5 w-[1px] bg-gray-300" />
          <Link to="/" className="absolute right-2 flex items-center px-1">
            <IoHomeOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </Link>
        </div>
        {user ? (
          <div className="flex items-center space-x-4">
            <IconButton
              icon={<CiBellOn className="h-7 w-7" />}
              onClick={() => {}}
            />
            <IconButton
              icon={<CiBoxList className="h-7 w-7" />}
              onClick={() => {}}
            />
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <IconButton
                  icon={<CiUser className="h-7 w-7" />}
                  onClick={() => {}}
                />
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <span className="text-white hover:text-gray-300 cursor-pointer">
                Login
              </span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
