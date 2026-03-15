import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/authAPI";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation toasts
    if (!formData.email || !formData.password) {
      toast.error("Both fields are required");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(formData);
      login(data?.user);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (err) {
      // This reads the exact message from your ApiError on backend
      const message = err.message || "Login failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-red-600 rounded-md w-8 h-5.5 flex items-center justify-center">
            <svg width="16" height="11" viewBox="0 0 18 13" fill="white">
              <path d="M17.177 2.026A2.27 2.27 0 0 0 15.582.414C14.225 0 9 0 9 0S3.775 0 2.418.414A2.27 2.27 0 0 0 .823 2.026C.414 3.393.414 6.25.414 6.25s0 2.857.409 4.224a2.27 2.27 0 0 0 1.595 1.612C3.775 12.5 9 12.5 9 12.5s5.225 0 6.582-.414a2.27 2.27 0 0 0 1.595-1.612C17.586 9.107 17.586 6.25 17.586 6.25s0-2.857-.409-4.224zM7.159 8.929V3.571l4.409 2.679-4.409 2.679z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            YouTube
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl p-6 sm:p-8">
          <h1 className="text-white text-2xl font-semibold mb-1">Sign in</h1>
          <p className="text-[#aaa] text-sm mb-6">to continue to YouTube</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#aaa]">Email or Username</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#aaa]">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#aaa] text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#3d9ae8] hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
