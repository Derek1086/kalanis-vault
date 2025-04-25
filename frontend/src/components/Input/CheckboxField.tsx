import React from "react";

/**
 * Props for the CheckboxField component
 * @interface CheckboxFieldProps
 * @property {string} id - The id attribute for the checkbox input and label association
 * @property {string} label - The text to display next to the checkbox
 * @property {boolean} checked - Whether the checkbox is checked
 * @property {(checked: boolean) => void} onChange - Function to execute when checkbox state changes
 */
interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * CheckboxField component
 *
 * A styled checkbox input with a label
 *
 * @param {CheckboxFieldProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[#c549d4] transition duration-150 ease-in-out focus:ring-2 focus:ring-offset-1 focus:ring-[#c549d4] border-gray-300 rounded"
      />
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
    </div>
  );
};
