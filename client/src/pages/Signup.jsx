import { useNavigate } from "react-router-dom";
import SignupForm from "../components/SignUpForm";

export default function Signup() {
  const navigate = useNavigate();
  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup-window">
        <SignupForm handleModalClose={() => navigate("/")} />
      </div>
    </div>
  );
}