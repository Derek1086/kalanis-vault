import React from "react";

/**
 * Props for the TextAreaField component
 * @interface TextAreaFieldProps
 * @extends React.TextareaHTMLAttributes<HTMLTextAreaElement>
 * @property {string} [label] - Optional label for the textarea
 * @property {number} [maxCharacters] - Maximum number of characters allowed
 */
interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxCharacters?: number;
}

/**
 * TextAreaField component
 *
 * A styled textarea field with optional label and character limit
 *
 * @param {TextAreaFieldProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  className = "",
  maxCharacters,
  ...props
}) => {
  return (
    <div className="relative flex-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        maxLength={maxCharacters}
        className={`px-3 py-2 w-full border-2 border-gray-300 rounded-md caret-[#c549d4] focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] ${className}`}
        {...props}
      />
    </div>
  );
};
