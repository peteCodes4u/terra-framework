import { NavDropdown } from "react-bootstrap";

export default function StyleToggler({ activeStyle, setActiveStyle }) {
    const availableStyles = [
        { label: "Style 1", value: "app-style1" },
        { label: "Style 2", value: "app-style2" },
        { label: "Style 3", value: "app-style3" },
        { label: "Style 4", value: "app-style4" },
        // Add more as needed
    ];

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
}