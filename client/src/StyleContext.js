// StyleContext.js
import { createContext, useContext } from "react";
export const StyleContext = createContext();
export const useStyle = () => useContext(StyleContext);