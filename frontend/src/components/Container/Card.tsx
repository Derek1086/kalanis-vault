import { ReactNode, forwardRef } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

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
