import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { registerUser, loginUser } from "../api/authAPI";
import toast from "react-hot-toast";

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverimage, setCoverimage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverimage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullname, username, email, password } = formData;

    // Client-side validation — all show as toasts
    if (!fullname || !username || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    if (!avatar) {
      toast.error("Avatar is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("fullname", fullname);
      data.append("username", username);
      data.append("email", email);
      data.append("password", password);
      data.append("avatar", avatar);
      if (coverimage) data.append("coverimage", coverimage);

      await registerUser(data);

      toast.success("Account created successfully!");

      // auto login after register
      const loginData = await loginUser({ email, password });
      login(loginData?.user);
      navigate("/");
    } catch (err) {
      // Reads exact message from your backend ApiError
      // e.g. "User with email or username already exists"
      const message = err.message || "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-10">
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
          <h1 className="text-white text-2xl font-semibold mb-1">
            Create account
          </h1>
          <p className="text-[#aaa] text-sm mb-6">to continue to YouTube</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Cover image picker */}
            <div
              className="relative w-full h-24 rounded-xl bg-[#272727] overflow-hidden cursor-pointer group"
              onClick={() => document.getElementById("coverInput").click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  className="w-full h-full object-cover"
                  alt="cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#aaa] text-xs gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  Add cover image (optional)
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                Change cover
              </div>
              <input
                id="coverInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 -mt-2">
              <div
                className="relative w-16 h-16 rounded-full bg-[#272727] overflow-hidden cursor-pointer group shrink-0 border-2 border-[#0f0f0f]"
                onClick={() => document.getElementById("avatarInput").click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#aaa]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-[#aaa] text-xs">
                Avatar is <span className="text-white">required</span>.<br />
                Click to upload your profile photo.
              </p>
            </div>

            {/* Text fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#aaa]">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#aaa]">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition text-sm"
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#aaa] text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3d9ae8] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
