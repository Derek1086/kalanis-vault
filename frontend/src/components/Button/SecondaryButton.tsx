import React from "react";

/**
 * Props for the SecondaryButton component
 * @interface SecondaryButtonProps
 * @property {"button" | "submit" | "reset"} [type="button"] - The button type attribute
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {React.ReactNode} children - The content to render inside the button
 * @property {() => void} [onClick] - Function to execute when button is clicked
 * @property {boolean} [disabled] - Whether the button is disabled
 */
interface SecondaryButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * SecondaryButton component
 *
 * A secondary styled button with darker purple background
 *
 * @param {SecondaryButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  type = "button",
  className = "",
  children,
  onClick = () => {},
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-[#692871] hover:bg-[#551e5b] text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#692871] focus:border-[#692871] focus:ring-offset-2 mt-2 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};
