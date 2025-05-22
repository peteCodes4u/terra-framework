// this file is used to create the header component
// import the navigation bar compnent to be used in the header
import NavigationBar from '../NavigationBar';

export default function Header({ toggleStylesheet, isStyle1Active, setIsStyle1Active }) {

    return (
        <header className="app-style1-header">
            <NavigationBar
                toggleStylesheet={toggleStylesheet}
                isStyle1Active={isStyle1Active}
                setIsStyle1Active={setIsStyle1Active}
            />
        </header>
    );
};