import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup-window">
        <LoginForm handleModalClose={() => navigate("/")} />
      </div>
    </div>
  );
}