import { useRouteError } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <Header />
      <center><div id="error-page">
        <h1>🙊 Hmmm... 🙈</h1>
        <p>😯 It seems something went wrong, please refresh the page and try again</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div></center>
      <Footer />
    </>
  )
}