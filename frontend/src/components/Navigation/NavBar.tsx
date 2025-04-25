import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../app/store";
import { logout, reset } from "../../features/auth/authSlice";
import { BACKEND_DOMAIN } from "../../types/playlists";

import {
  CiCirclePlus,
  CiBoxList,
  CiUser,
  CiLogout,
  CiHeart,
} from "react-icons/ci";
import { IoHomeOutline, IoSearch } from "react-icons/io5";

import { SearchField } from "../Input";
import { IconButton } from "../Button";
import { DropDownMenu, DropDownItem, DropDownDivider } from "./DropDown";

interface NavBarProps {
  onCreatePlaylist?: () => void;
}

/**
 * Navigation bar component that displays a search field and user controls.
 * Handles user authentication state and provides navigation functionality.
 * Features:
 * - Search functionality
 * - User dropdown menu with logout option
 * - Responsive design
 * - User profile picture display
 */
const NavBar = ({ onCreatePlaylist }: NavBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  // Default profile image path
  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  // Get profile image URL
  const profileImageUrl = userInfo?.profile_picture
    ? `${BACKEND_DOMAIN}${userInfo.profile_picture}`
    : defaultProfileImage;

  /**
   * Updates the search query state when the search input changes
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handles search on enter key press
   * Navigates to search page when Enter key is pressed
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
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
            icon={<IoSearch className="h-5 w-5 text-gray-400 cursor-pointer" />}
            className="pr-20"
            onClear={() => setSearchQuery("")}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-10 h-5 w-[1px] bg-gray-300" />
          <Link to="/" className="absolute right-2 flex items-center px-1">
            <IoHomeOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </Link>
        </div>
        {user ? (
          <div className="flex items-center space-x-4">
            <IconButton
              icon={<CiCirclePlus className="h-7 w-7" />}
              onClick={onCreatePlaylist}
            />
            <IconButton
              icon={<CiBoxList className="h-7 w-7" />}
              onClick={() => {
                navigate(`/${userInfo.username}/playlists`);
              }}
            />
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={profileImageUrl}
                    alt={`${userInfo?.first_name || "User"}'s profile`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // If profile image fails to load, use default
                      e.currentTarget.src = defaultProfileImage;
                    }}
                  />
                </div>
              </div>

              {dropdownOpen && (
                <DropDownMenu>
                  <DropDownItem
                    onClick={() => {
                      navigate(`/${userInfo.username}/profile`);
                      setDropdownOpen(false);
                    }}
                    icon={<CiUser className="h-5 w-5" />}
                  >
                    Profile
                  </DropDownItem>
                  <DropDownItem
                    onClick={() => {
                      navigate(`/${userInfo.username}/playlists`);
                      setDropdownOpen(false);
                    }}
                    icon={<CiBoxList className="h-5 w-5" />}
                  >
                    My Playlists
                  </DropDownItem>
                  <DropDownItem
                    icon={<CiHeart className="h-5 w-5" />}
                    onClick={() => {
                      navigate(`/${userInfo.username}/liked-playlists`);
                      setDropdownOpen(false);
                    }}
                  >
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
