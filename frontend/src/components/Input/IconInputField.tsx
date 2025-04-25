import React from "react";

/**
 * Props for the IconInputField component
 * @interface IconInputFieldProps
 * @property {string} type - The input type attribute
 * @property {string} placeholder - Placeholder text for the input
 * @property {string} name - The name attribute for the input
 * @property {React.ChangeEventHandler<HTMLInputElement>} onChange - Function to execute when input value changes
 * @property {string} value - The current value of the input
 * @property {boolean} [required=false] - Whether the input is required
 * @property {boolean} [autoFocus=false] - Whether the input should autofocus
 * @property {React.ReactNode} icon - The icon to display in the input
 * @property {string} [className] - Additional CSS classes to apply to the icon wrapper
 * @property {React.KeyboardEventHandler<HTMLInputElement>} [onKeyDown] - Function to execute on key down events
 * @property {boolean} [disabled=false] - Whether the input is disabled
 */
interface IconInputFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
  autoFocus?: boolean;
  icon: React.ReactNode;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
}

/**
 * IconInputField component
 *
 * An input field with an icon displayed on the left side
 *
 * @param {IconInputFieldProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const IconInputField: React.FC<IconInputFieldProps> = ({
  type,
  placeholder,
  name,
  onChange,
  value,
  required = false,
  autoFocus = false,
  icon,
  className = "",
  onKeyDown = () => {},
  disabled = false,
}) => {
  return (
    <div className="relative">
      <div
        className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${className}`}
      >
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="pl-10 pr-3 py-2 w-full border-2 border-gray-300 rounded-md caret-[#c549d4] focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
    </div>
  );
};
