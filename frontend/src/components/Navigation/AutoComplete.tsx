import { useRef, useEffect } from "react";
import { FaHistory } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

interface AutoCompleteProps {
  searchQuery: string;
  searchHistory: string[];
  show: boolean;
  onSelectItem: (query: string) => void;
  onRemoveItem: (query: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

/**
 * AutoComplete component that displays search history as suggestions
 * Features:
 * - Displays filtered search history based on current query
 * - Allows selecting history items
 * - Allows removing history items
 * - Closes when clicked outside
 */
const AutoComplete = ({
  searchQuery,
  searchHistory,
  show,
  onSelectItem,
  onRemoveItem,
  onClose,
}: AutoCompleteProps) => {
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  /**
   * Filter search history based on current search query
   * Returns history items that include the current query (case insensitive)
   * @returns {string[]} Filtered search history items
   */
  const getFilteredSearchHistory = () => {
    if (!searchQuery.trim()) {
      return searchHistory; // Return all history when query is empty
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    return searchHistory.filter((item) =>
      item.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Effect to close dropdown menu when clicking outside
   * Sets up event listener for clicks outside the autocomplete reference
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autoCompleteRef.current &&
        !autoCompleteRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const filteredHistory = getFilteredSearchHistory();

  if (!show || filteredHistory.length === 0) {
    return null;
  }

  return (
    <div
      ref={autoCompleteRef}
      className="absolute z-50 w-full bg-[#1e1c1f] top-12 rounded-md shadow-lg"
    >
      <ul className="max-h-64 overflow-y-auto">
        {filteredHistory.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex items-center justify-between px-4 py-2 hover:bg-[#2a282b] cursor-pointer text-white"
            onClick={() => onSelectItem(item)}
          >
            <div className="flex items-center">
              <FaHistory className="h-4 w-4 text-gray-400 mr-2" />
              <span>{item}</span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={(e) => onRemoveItem(item, e)}
              aria-label={`Remove ${item} from search history`}
            >
              <IoMdClose className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AutoComplete;
