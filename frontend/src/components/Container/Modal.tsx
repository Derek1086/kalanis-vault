import React, { useEffect, useRef } from "react";
import { Card } from "./Card";
import { Header, SecondaryText } from "../Typography";
import { IconButton } from "../Button";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-md",
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
        className={`relative p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
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
