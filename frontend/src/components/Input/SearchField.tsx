import React, { forwardRef } from "react";
import { MdClear } from "react-icons/md";

/**
 * Props for the SearchField component
 * @interface SearchFieldProps
 * @property {string} type - The input type attribute
 * @property {string} placeholder - Placeholder text for the input
 * @property {string} name - The name attribute for the input
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} onChange - Function to execute when input value changes
 * @property {(e: React.KeyboardEvent) => void} [onKeyDown] - Function to execute on key down events
 * @property {() => void} [onFocus] - Function to execute when input is focused
 * @property {string} value - The current value of the input
 * @property {React.ReactNode} [icon] - The icon to display on the left side of the input
 * @property {string} [className] - Additional CSS classes to apply to the input
 * @property {() => void} [onClear] - Function to execute when clear button is clicked
 * @property {string} [autoComplete="on"] - The autocomplete attribute for the input
 */
interface SearchFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  value: string;
  icon?: React.ReactNode;
  className?: string;
  onClear?: () => void;
  autoComplete?: string;
}

/**
 * SearchField component
 *
 * A search input field with icon and clear button
 *
 * @param {SearchFieldProps} props - Component props
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref for the input element
 * @returns {JSX.Element} - Rendered component
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      type,
      placeholder,
      name,
      onChange,
      onKeyDown,
      onFocus,
      value,
      icon,
      className,
      onClear,
      autoComplete = "on",
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className={`bg-[#242424] caret-[#c549d4] text-white text-sm rounded-lg block w-full pl-10 p-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c549d4] ${className}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
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
  }
);
