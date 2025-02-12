import axios from "axios";
import { useState } from "react";

const Login = ({setIsAuthenticated}: {setIsAuthenticated: (isAuthenticated: boolean) => void}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `https://5pqs5m-5000.csb.app/api/auth/signup`,
        {
          email,
          password,
        }
      );

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('email', email)
      if(response.status === 201){
        setIsAuthenticated(true)
      }
      return response.data; // { message, token 
    } catch (error: any) {
      return { error: error.response?.data?.message || "Signup failed" };
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-700">Signup</h2>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-600">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
