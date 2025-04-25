import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../app/store";

import NavBar from "../components/Navigation/NavBar";
import OwnProfile from "../components/Profile/OwnProfile";
import UserProfile from "../components/Profile/UserProfile";

const ProfilePage = () => {
  const { username } = useParams();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const isOwnProfile = userInfo && userInfo.username === username;

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-start justify-center p-4 bg-gradient-to-r from-[#c549d4] to-[#9b36b7]">
        <div className="w-full max-w-4xl bg-[#242424] rounded-xl shadow-lg overflow-hidden text-white">
          {username &&
            (isOwnProfile ? (
              <OwnProfile username={username} />
            ) : (
              <UserProfile username={username} />
            ))}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
