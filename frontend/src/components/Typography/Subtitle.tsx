import React from "react";

/**
 * Props for the Subtitle component
 * @interface SubtitleProps
 * @property {string} text - The subtitle text to display
 * @property {string} [className] - Additional CSS classes to apply to the subtitle
 */
interface SubtitleProps {
  text: string;
  className?: string;
}

/**
 * Subtitle component
 *
 * A component for displaying centered subtitles
 * Used for section subtitles or explanatory text beneath headings
 *
 * @param {SubtitleProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const Subtitle: React.FC<SubtitleProps> = ({ text, className = "" }) => {
  return (
    <p className={`text-sm text-center text-gray-400 ${className}`}>{text}</p>
  );
};
