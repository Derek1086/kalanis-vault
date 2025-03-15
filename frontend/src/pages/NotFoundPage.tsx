import { useNavigate } from "react-router-dom";

import { IoHomeOutline } from "react-icons/io5";

import { Card } from "../components/Container";
import { Header, SecondaryText } from "../components/Typography";
import { PrimaryIconButton } from "../components/Button";

/**
 * NotFoundPage Component
 *
 * Displays a 404 error page when users navigate to non-existent routes.
 * Provides a button to return to the home page.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex flex-col items-center mb-6">
        <Header text="404" className="text-6xl" />
        <Header text="Page Not Found" />
        <SecondaryText
          text="The page you're looking for doesn't exist."
          className="text-gray-400 mb-4 mt-4"
        />
        <PrimaryIconButton
          type="button"
          icon={<IoHomeOutline className="h-4 w-4" />}
          onClick={() => navigate("/")}
        >
          Back to Home
        </PrimaryIconButton>
      </div>
    </Card>
  );
};

export default NotFoundPage;
