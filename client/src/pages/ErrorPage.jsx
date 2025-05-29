import { useRouteError } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  const activeStyle = localStorage.getItem("selectedStyle") || "app-style1";

  return (
    <>
      <Header activeStyle={activeStyle}/>
      <center><div id="error-page">
        <h1>🙊 Hmmm... 🙈</h1>
        <br></br>
        <p>😯 There seems to be an issue with this URL, double check your URL and try again Thank you! 😯</p>
       <br></br>
        <p>
          <h4>Specific Error see below:</h4>
          <i>{error.statusText || error.message}</i>
        </p>
      </div></center>
      <Footer activeStyle={activeStyle}/>
    </>
  )
}