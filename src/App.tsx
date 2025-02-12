import Dashboard from "./components/Dashboard";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import axios from "axios";
import { Toaster } from 'react-hot-toast';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkIsAuthenticated = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const verifyData = await axios.get(
          `https://5pqs5m-5000.csb.app/api/auth/verify/${token}`
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
      <Toaster />
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login setIsAuthenticated={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;
