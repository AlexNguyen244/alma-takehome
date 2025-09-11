import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  let title = 'An error occured!';
  let message = 'Something went wrong!';
  
    return (
      <>
        <h1>{title}</h1>
        <h2>{message}</h2>
      </>
    );
  }
  
  export default ErrorPage;