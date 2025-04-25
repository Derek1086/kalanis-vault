import React from "react";

/**
 * Props for the SecondaryText component
 * @interface SecondaryTextProps
 * @property {string} text - The text content to display
 * @property {string} [className] - Additional CSS classes to apply to the text
 */
interface SecondaryTextProps {
  text: string;
  className?: string;
}

/**
 * SecondaryText component
 *
 * A component for displaying explanatory or supportive text
 * Used for additional information or descriptions
 *
 * @param {SecondaryTextProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const SecondaryText: React.FC<SecondaryTextProps> = ({
  text,
  className = "",
}) => {
  return <p className={`text-sm ${className}`}>{text}</p>;
};
