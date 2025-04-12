import React, { useState } from "react";
import { Header } from "../Typography";
import { IconButton } from "../Button/IconButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CarouselBarProps {
  title: string;
  children?: React.ReactNode;
  itemsPerPage?: number;
  totalItems?: number;
}

const CarouselBar: React.FC<CarouselBarProps> = ({
  title,
  children,
  itemsPerPage = 3,
  totalItems = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Calculate if there are enough items to enable navigation
  const maxIndex = Math.max(0, totalItems - itemsPerPage);
  const hasItems = totalItems > 0;

  const nextItems = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage >= totalItems ? 0 : prev + itemsPerPage
    );
  };

  const prevItems = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerPage < 0
        ? Math.max(0, totalItems - itemsPerPage)
        : prev - itemsPerPage
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6 mx-[50px]">
        <Header text={title} className="text-3xl font-bold" />
        <div className="flex items-center space-x-2">
          <IconButton
            icon={<FaChevronLeft className="h-5 w-5" />}
            onClick={prevItems}
            className="h-8 w-8 flex items-center justify-center"
            disabled={!hasItems || totalItems <= itemsPerPage}
          />
          <IconButton
            icon={<FaChevronRight className="h-5 w-5" />}
            onClick={nextItems}
            className="h-8 w-8 flex items-center justify-center"
            disabled={!hasItems || totalItems <= itemsPerPage}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default CarouselBar;
