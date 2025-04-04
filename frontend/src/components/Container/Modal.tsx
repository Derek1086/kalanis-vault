import React, { useEffect, useRef, useState } from "react";

import { Card } from "./Card";
import { Header, SecondaryText } from "../Typography";
import { IconButton } from "../Button";
import { IconInputField } from "../Input";
import { PrimaryButton } from "../Button";

import { IoMdClose } from "react-icons/io";
import { CiBoxList } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [playlistName, setPlaylistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playlistName.trim()) return;

    setIsLoading(true);

    setTimeout(() => {
      console.log("Playlist created:", playlistName);
      setIsLoading(false);
      setPlaylistName("");
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card ref={modalRef} className="relative p-6 w-full">
        <div className="absolute top-2 right-2">
          <IconButton icon={<IoMdClose size={20} />} onClick={onClose} />
        </div>
        <Header text={title} />
        <SecondaryText text={description} className="text-gray-400 mb-4 mt-4" />
        <form className="space-y-4" onSubmit={handleSubmit}>
          <IconInputField
            type="text"
            placeholder="Playlist Name"
            name="playlistName"
            onChange={handleChange}
            value={playlistName}
            required
            autoFocus
            icon={<CiBoxList className="h-5 w-5 text-gray-400" />}
          />
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
            ) : (
              "Create Playlist"
            )}
          </PrimaryButton>
        </form>
      </Card>
    </div>
  );
};
