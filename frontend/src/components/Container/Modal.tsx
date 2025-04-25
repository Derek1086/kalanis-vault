import React, { useEffect, useRef } from "react";
import { Card } from "./Card";
import { Header, SecondaryText } from "../Typography";
import { IconButton } from "../Button";
import { IoMdClose } from "react-icons/io";

/**
 * Props for the Modal component
 * @interface ModalProps
 * @property {boolean} isOpen - Controls whether the modal is displayed
 * @property {() => void} onClose - Function to call when the modal should close
 * @property {string} title - The title text to display in the modal header
 * @property {string} [description] - Optional description text to display below the title
 * @property {React.ReactNode} children - The content to render inside the modal
 * @property {string} [maxWidth="max-w-md"] - Maximum width of the modal
 * @property {string} [minWidth="min-w-md"] - Minimum width of the modal
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  minWidth?: string;
}

/**
 * Modal component
 *
 * A dialog box that appears on top of the main content with a semi-transparent overlay
 * Closes when clicking outside the modal area
 *
 * @param {ModalProps} props - Component props
 * @returns {JSX.Element|null} - Rendered component or null if not open
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-md",
  minWidth = "min-w-md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card
        ref={modalRef}
        className={`relative p-6 w-full ${maxWidth} ${minWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="absolute top-2 right-2">
          <IconButton icon={<IoMdClose size={20} />} onClick={onClose} />
        </div>
        <Header text={title} />
        {description && (
          <SecondaryText
            text={description}
            className="text-gray-400 mb-4 mt-4"
          />
        )}
        {children}
      </Card>
    </div>
  );
};
