import { TagData } from "../../types/playlists";

interface TagCardProps {
  index: number;
  tag: TagData;
  className?: string;
}

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
