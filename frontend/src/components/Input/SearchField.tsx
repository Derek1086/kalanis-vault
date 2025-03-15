/**
 * Search input field with icon and clear button.
 * Used for search functionality throughout the application.
 */
import React from "react";
import { MdClear } from "react-icons/md";

interface SearchFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  icon: React.ReactNode;
  className?: string;
  onClear?: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  type,
  placeholder,
  name,
  onChange,
  value,
  icon,
  className = "",
  onClear,
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        className={`pl-10 pr-12 py-2 w-full border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] ${className}`}
      />
      {value.length > 0 && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-10 px-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <MdClear className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
