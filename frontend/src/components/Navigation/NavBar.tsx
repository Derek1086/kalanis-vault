import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../app/store";
import { logout, reset } from "../../features/auth/authSlice";
import { BACKEND_DOMAIN } from "../../types/playlists";

import { SearchField } from "../Input";
import { IconButton } from "../Button";
import { DropDownMenu, DropDownItem, DropDownDivider } from "./DropDown";
import AutoComplete from "./AutoComplete";

import {
  CiCirclePlus,
  CiBoxList,
  CiUser,
  CiLogout,
  CiHeart,
} from "react-icons/ci";
import { IoHomeOutline, IoSearch } from "react-icons/io5";

interface NavBarProps {
  onCreatePlaylist?: () => void;
}

const MAX_SEARCH_HISTORY = 5;

/**
 * Navigation bar component that displays a search field and user controls.
 * Handles user authentication state and provides navigation functionality.
 * Features:
 * - Search functionality with search history autocomplete that filters based on query
 * - User dropdown menu with logout option
 * - Responsive design
 * - User profile picture display
 */
const NavBar = ({ onCreatePlaylist }: NavBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, userInfo } = useSelector((state: RootState) => state.auth);

  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  const profileImageUrl = userInfo?.profile_picture
    ? `${BACKEND_DOMAIN}${userInfo.profile_picture}`
    : defaultProfileImage;

  /**
   * Effect hook to load search history from localStorage on component mount
   */
  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  /**
   * Updates the search query state when the search input changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the search input
   */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Adds a new search query to search history and stores in localStorage
   * Limits history to MAX_SEARCH_HISTORY items and prevents duplicates
   * @param {string} query - The search query to add to history
   */
  const addToSearchHistory = (query: string) => {
    if (!query.trim() || query.length < 2) return;

    const updatedHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, MAX_SEARCH_HISTORY);

    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  /**
   * Removes a search query from search history and updates localStorage
   * @param {string} query - The search query to remove from history
   * @param {React.MouseEvent} e - The click event
   */
  const removeFromSearchHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering search when clicking the X button

    const updatedHistory = searchHistory.filter((item) => item !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  /**
   * Handles search on enter key press
   * Navigates to search page when Enter key is pressed
   * @param {React.KeyboardEvent} e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchHistory(false);
    }
  };

  /**
   * Handles selecting a search history item
   * Updates search query, adds to history, and navigates to search page
   * @param {string} query - The selected history item query
   */
  const handleSelectHistoryItem = (query: string) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    navigate(`/search/${encodeURIComponent(query)}`);
    setShowSearchHistory(false);
  };

  /**
   * Shows search history dropdown when search input is focused
   */
  const handleSearchFocus = () => {
    setShowSearchHistory(true);
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
            onClear={() => {
              setSearchQuery("");
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleSearchFocus}
            ref={searchInputRef}
            autoComplete="off"
          />
          <div className="absolute right-10 h-5 w-[1px] bg-gray-300" />
          <Link to="/" className="absolute right-2 flex items-center px-1">
            <IoHomeOutline className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </Link>

          <AutoComplete
            searchQuery={searchQuery}
            searchHistory={searchHistory}
            show={showSearchHistory}
            onSelectItem={handleSelectHistoryItem}
            onRemoveItem={removeFromSearchHistory}
            onClose={() => setShowSearchHistory(false)}
          />
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
