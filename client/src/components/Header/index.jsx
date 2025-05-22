// this file is used to create the header component
// import the navigation bar compnent to be used in the header
import NavigationBar from '../NavigationBar';

export default function Header({ toggleStylesheet, activeStyle, setActiveStyle }) {

    return (
        <header className={`${activeStyle}-header`}>
            <NavigationBar
                toggleStylesheet={toggleStylesheet}
                activeStyle={activeStyle}
                setActiveStyle={setActiveStyle}
            />
        </header>
    );
};