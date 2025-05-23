// StyleContext.js is used to manage the active style of the application. It provides a context for the active style and a custom hook to access it. The context is created using React's createContext and useContext hooks, allowing components to consume the active style easily.
import { createContext, useContext } from "react";

// Create a context for the active style
export const StyleContext = createContext();
// Create a provider component to leverage the context
export const useStyle = () => useContext(StyleContext);