import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { RingLoader } from "react-spinners";
import { FaEnvelope, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const { userType } = useParams(); // Get the user type from the URL
  const navigate = useNavigate(); // Use navigate for redirection
  const [officialEmail, setOfficialEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for the login button

  const handleLogin = async (e) => {
    e.preventDefault();
    let endpoint;

    // Determine the endpoint based on user type
    if (userType === "issuing-auth") {
      endpoint = "http://localhost:5000/api/auth/login/issuing-auth";
    } else if (userType === "verifying-auth") {
      endpoint = "http://localhost:5000/api/auth/login/verifying-auth";
    } else if (userType === "individual") {
      endpoint = "http://localhost:5000/api/individual/login";
    } else if (userType === "admin") {
      endpoint = "http://localhost:5000/api/admin/login";
    } else {
      toast.error("Invalid user type");
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await axios.post(endpoint, { officialEmail, password });

      // Store the token in localStorage if login is successful
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", userType);
        localStorage.setItem("userUniqueID", response.data.redirectUrl.split("/")[2]);
      }

      toast.success(response.data.message);

      // Redirect after a successful login
      setTimeout(() => {
        navigate(response.data.redirectUrl);
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error(error);

      // Handle error responses
      if (!error.response?.data?.status) {
        toast.error(error.response?.data?.message || "Login failed");
      } else if (error.response?.data?.status !== "approved") {
        toast.error(error.response?.data?.message);
       // alert("Redirecting to the dashboard...");
        setTimeout(() => {
          navigate(`/`);
        }, 2000);
        return;
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white-50 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-3xl text-center text-violet-700 font-semibold mb-8">
          Login as {userType?.replace("-", " ")}
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Official Email Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaEnvelope className="text-blue-600 mr-3" />
            <input
              type="email"
              value={officialEmail}
              onChange={(e) => setOfficialEmail(e.target.value)}
              required
              placeholder="Official Email Address"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center border-b-2 border-gray-300 pb-3">
            <FaLock className="text-blue-600 mr-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className={`w-full py-3 rounded-md text-white font-semibold transition duration-300 ease-in-out ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              }`}
              disabled={loading}
            >
              {loading ? <RingLoader size={24} color="#ffffff" /> : "Login"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
