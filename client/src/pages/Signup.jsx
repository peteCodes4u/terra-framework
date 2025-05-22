import { useNavigate } from "react-router-dom";
import SignupForm from "../components/SignUpForm";
import { useStyle } from "../StyleContext";

export default function Signup() {
  const { activeStyle } = useStyle();
  const navigate = useNavigate();
  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup-window">
        <SignupForm
          handleModalClose={() => navigate("/")}
          activeStyle={activeStyle}
        />
      </div>
    </div>
  );
}