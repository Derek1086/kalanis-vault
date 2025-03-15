/**
 * Standard input field without additional elements.
 * Base component for text input throughout the application.
 */
import React from "react";

interface InputFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
  autoFocus?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  name,
  onChange,
  value,
  required = false,
  autoFocus = false,
}) => {
  return (
    <div className="relative flex-1">
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        autoFocus={autoFocus}
        className="px-3 py-2 w-full border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
    </div>
  );
};
