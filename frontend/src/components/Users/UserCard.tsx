import React from "react";
import { Link } from "react-router-dom";
import { BACKEND_DOMAIN } from "../../types/playlists.ts";

import { Card } from "../Container";
import { Header, Subtitle } from "../Typography";

/**
 * Props interface for the UserCard component
 *
 * @interface UserCardProps
 * @property {Object} user - The user data object to be displayed
 * @property {number} user.id - User's unique ID
 * @property {string} user.username - User's username
 * @property {string} user.first_name - User's first name
 * @property {string} user.last_name - User's last name
 * @property {string | null} user.profile_picture - URL or path to user's profile picture
 * @property {number} user.follower_count - Number of followers the user has
 */
interface UserCardProps {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
    follower_count: number;
  };
}

/**
 * Component for displaying a user in a card format with profile picture and details
 *
 * @component
 * @param {UserCardProps} props - The component props
 * @param {Object} props.user - The user data to display
 * @returns {JSX.Element} The rendered UserCard component
 */
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const defaultProfileImage = `${BACKEND_DOMAIN}/media/profile_pics/default.png`;

  return (
    <Link to={`/${user.username}/profile`} className="block">
      <Card className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md text-left">
        <div className="h-48 bg-gray-800 w-full">
          <img
            src={
              user.profile_picture
                ? user.profile_picture.startsWith("http")
                  ? user.profile_picture
                  : `${BACKEND_DOMAIN}${user.profile_picture}`
                : defaultProfileImage
            }
            alt={`${user.first_name || "User"} ${user.last_name || ""}`}
            className="w-full h-full object-cover rounded-none bg-transparent"
            onError={(e) => {
              e.currentTarget.src = defaultProfileImage;
            }}
          />
        </div>
        <div className="p-2 w-full">
          <Header
            text={`${user.first_name} ${user.last_name}`}
            className="font-semibold text-lg truncate w-full text-left"
          />
          <Subtitle
            text={`${user.username} • ${user.follower_count} ${
              user.follower_count === 1 ? "follower" : "followers"
            }`}
            className="text-sm w-full text-left"
          />
        </div>
      </Card>
    </Link>
  );
};

export default UserCard;
