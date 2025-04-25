import { ReactNode, forwardRef } from "react";

/**
 * Props for the Card component
 * @interface CardProps
 * @property {ReactNode} children - The content to be rendered inside the card
 * @property {string} [className] - Additional CSS classes to apply to the card
 * @property {() => void} [onClick] - Function to execute when card is clicked
 */
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Card component
 *
 * A container component with rounded corners and shadow styling
 *
 * @param {CardProps} props - Component props
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {JSX.Element} - Rendered component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", onClick = () => {} }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`w-full max-w-md rounded-xl shadow-lg overflow-hidden bg-[#151316] ${className}`}
      >
        <div className="p-6">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
