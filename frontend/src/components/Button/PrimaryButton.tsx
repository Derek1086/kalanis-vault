import React from "react";

/**
 * Props for the PrimaryButton component
 * @interface PrimaryButtonProps
 * @property {"button" | "submit" | "reset"} [type="button"] - The button type attribute
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {React.ReactNode} children - The content to render inside the button
 * @property {(e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>} [onClick] - Function to execute when button is clicked
 */
interface PrimaryButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

/**
 * PrimaryButton component
 *
 * A primary styled button with purple background
 *
 * @param {PrimaryButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  type = "button",
  className = "",
  disabled = false,
  children,
  onClick = () => {},
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full bg-[#c549d4] hover:bg-[#b23abc] text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] focus:ring-offset-2 mt-2 cursor-pointer flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
};
