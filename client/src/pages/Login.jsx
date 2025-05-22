import { useStyle } from "../StyleContext";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { activeStyle } = useStyle();
  const navigate = useNavigate();
  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup-window">
        <LoginForm
          activeStyle={activeStyle}
          handleModalClose={() => navigate("/")}
        />
      </div>
    </div>
  );
}