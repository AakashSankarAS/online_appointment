import { useEffect } from "react";
import { makeApiCall } from "./services/service";

function App() {
  useEffect(() => {
    const data = makeApiCall();
    console.log(data);
  }, []);

  return <></>;
}

export default App;
