import { NavDropdown } from "react-bootstrap";
export default function StyleToggler({ activeStyle, setActiveStyle, availableStyles }) {
    return (
        <NavDropdown title="Theme" id="theme-dropdown" className="ms-2">
            {availableStyles.map(style => (
                <NavDropdown.Item
                    key={style.value}
                    active={activeStyle === style.value}
                    onClick={() => setActiveStyle(style.value)}
                >
                    {style.label}
                </NavDropdown.Item>
            ))}
        </NavDropdown>
    );
};