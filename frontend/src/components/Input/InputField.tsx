import React from "react";

/**
 * Props for the InputField component
 * @interface InputFieldProps
 * @property {string} type - The input type attribute
 * @property {string} placeholder - Placeholder text for the input
 * @property {string} name - The name attribute for the input
 * @property {React.ChangeEventHandler<HTMLInputElement>} onChange - Function to execute when input value changes
 * @property {string} value - The current value of the input
 * @property {boolean} [required=false] - Whether the input is required
 * @property {boolean} [autoFocus=false] - Whether the input should autofocus
 */
interface InputFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
  autoFocus?: boolean;
}

/**
 * InputField component
 *
 * A basic styled input field
 *
 * @param {InputFieldProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
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
        className="px-3 py-2 w-full border-2 border-gray-300 rounded-md caret-[#c549d4] focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
    </div>
  );
};
