import { ReactNode, forwardRef } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          ref={ref}
          className={`w-full max-w-md rounded-xl shadow-lg overflow-hidden bg-[#151316] ${className}`}
        >
          <div className="p-8">{children}</div>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";
