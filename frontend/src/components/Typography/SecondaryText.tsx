/**
 * Subtitle component for displaying centered subtitles
 * Used for section subtitles or explanatory text beneath headings
 *
 * @param text - The subtitle text to display
 */
import React from "react";

interface SecondaryTextProps {
  text: string;
  className?: string;
}

export const SecondaryText: React.FC<SecondaryTextProps> = ({
  text,
  className = "",
}) => {
  return <p className={`text-sm ${className}`}>{text}</p>;
};
