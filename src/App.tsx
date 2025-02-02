import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import axios from "axios";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkIsAuthenticated = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const verifyData = await axios.get(
          `http://localhost:5000/api/auth/verify/${token}`
        );
        console.log(verifyData);
        if (verifyData.data.message === "valid") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkIsAuthenticated();
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login setIsAuthenticated={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;
