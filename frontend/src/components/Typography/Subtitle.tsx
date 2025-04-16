/**
 * Subtitle component for displaying centered subtitles
 * Used for section subtitles or explanatory text beneath headings
 *
 * @param text - The subtitle text to display
 */
import React from "react";

interface SubtitleProps {
  text: string;
  className?: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text, className = "" }) => {
  return (
    <p className={`text-sm text-center text-gray-400 ${className}`}>{text}</p>
  );
};
