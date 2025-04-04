/**
 * Subtitle component for displaying centered subtitles
 * Used for section subtitles or explanatory text beneath headings
 *
 * @param text - The subtitle text to display
 */
import React from "react";

interface SubtitleProps {
  text: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text }) => {
  return <p className="text-sm text-center">{text}</p>;
};
