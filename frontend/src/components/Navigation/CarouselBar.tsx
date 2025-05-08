import React, { useState, useRef, useEffect } from "react";
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
  const [showControls, setShowControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const hasOverflow =
          contentRef.current.scrollWidth > contentRef.current.clientWidth;
        setShowControls(hasOverflow);
        updateScrollButtons();
      }
    };

    // Check on mount and whenever children or dimensions might change
    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [children, totalItems]);

  const updateScrollButtons = () => {
    if (contentRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for potential rounding errors
    }
  };

  const scrollLeft = () => {
    if (contentRef.current) {
      const scrollAmount =
        (contentRef.current.clientWidth / itemsPerPage) *
        Math.min(itemsPerPage, 3);
      contentRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });

      // Update button states after scrolling
      setTimeout(updateScrollButtons, 500); // After animation completes
    }
  };

  const scrollRight = () => {
    if (contentRef.current) {
      const scrollAmount =
        (contentRef.current.clientWidth / itemsPerPage) *
        Math.min(itemsPerPage, 3);
      contentRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      // Update button states after scrolling
      setTimeout(updateScrollButtons, 500); // After animation completes
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6 mx-[70px]">
        <Header text={title} className="text-3xl font-bold" />
        {showControls && (
          <div className="flex items-center space-x-2">
            <IconButton
              icon={<FaChevronLeft className="h-5 w-5" />}
              onClick={scrollLeft}
              className="h-8 w-8 flex items-center justify-center"
              disabled={!canScrollLeft}
            />
            <IconButton
              icon={<FaChevronRight className="h-5 w-5" />}
              onClick={scrollRight}
              className="h-8 w-8 flex items-center justify-center"
              disabled={!canScrollRight}
            />
          </div>
        )}
      </div>
      <div
        ref={contentRef}
        className="overflow-x-auto scrollbar-hide"
        onScroll={updateScrollButtons}
      >
        {children}
      </div>
    </div>
  );
};

export default CarouselBar;
