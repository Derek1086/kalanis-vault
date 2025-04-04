import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../app/store";
import { logout, reset } from "../../features/auth/authSlice";

import { CiBellOn, CiBoxList, CiUser, CiLogout, CiHeart } from "react-icons/ci";
import { IoHomeOutline, IoSearch } from "react-icons/io5";

import { SearchField } from "../Input";
import { IconButton } from "../Button";
import { DropDownMenu, DropDownItem, DropDownDivider } from "./DropDown";

/**
 * Navigation bar component that displays a search field and user controls.
 * Handles user authentication state and provides navigation functionality.
 * Features:
 * - Search functionality
 * - User dropdown menu with logout option
 * - Responsive design
 */
const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  /**
   * Updates the search query state when the search input changes
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handles user logout process:
   * 1. Dispatches logout action
   * 2. Resets auth state
   * 3. Navigates to login page
   * 4. Closes dropdown menu
   */
  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
    setDropdownOpen(false);
  };

  /**
   * Effect to close dropdown menu when clicking outside
   * Sets up event listener for clicks outside the dropdown reference
   */
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
          <Link to="/">
            <span className="text-2xl font-bold text-white">
              Kalani's Vault
            </span>
          </Link>
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
                <DropDownMenu>
                  <DropDownItem
                    onClick={() => {
                      navigate(`/${userInfo.username}/profile`);
                    }}
                    icon={<CiUser className="h-5 w-5" />}
                  >
                    Profile
                  </DropDownItem>
                  <DropDownItem icon={<CiBoxList className="h-5 w-5" />}>
                    My Playlists
                  </DropDownItem>
                  <DropDownItem icon={<CiHeart className="h-5 w-5" />}>
                    My Likes
                  </DropDownItem>
                  <DropDownDivider />
                  <DropDownItem
                    onClick={handleLogout}
                    icon={<CiLogout className="h-5 w-5" />}
                  >
                    Logout
                  </DropDownItem>
                </DropDownMenu>
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
