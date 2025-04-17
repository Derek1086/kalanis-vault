import React from "react";

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

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
