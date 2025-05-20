// this file is used to create the header component
// import the navigation bar compnent to be used in the header
import NavigationBar from '../NavigationBar';

export default function Header({ toggleStylesheet }) {

    return (
        <header>
            <NavigationBar  toggleStylesheet={toggleStylesheet}/>
        </header>
    );
};