import { TagData } from "../../types/playlists";

/**
 * Props for the TagCard component
 * @interface TagCardProps
 * @property {number} index - The index of the tag in a list (used as key)
 * @property {TagData} tag - The tag data object containing tag information
 * @property {string} [className] - Optional additional CSS classes to apply to the component
 */
interface TagCardProps {
  index: number;
  tag: TagData;
  className?: string;
}

/**
 * Renders a single tag as a rounded pill/badge
 *
 * @component
 * @param {object} props - Component props
 * @param {number} props.index - The index of the tag in a list (used as key)
 * @param {TagData} props.tag - The tag data object containing tag information
 * @param {string} [props.className=""] - Optional additional CSS classes to apply to the component
 * @returns {JSX.Element} A styled tag component
 */
const TagCard: React.FC<TagCardProps> = ({ index, tag, className = "" }) => {
  return (
    <span
      key={index}
      className={`bg-[#c549d4] py-2 px-4 rounded-full text-sm text-white ${className}`}
    >
      {tag.name}
    </span>
  );
};

export default TagCard;
