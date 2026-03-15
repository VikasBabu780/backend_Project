import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Menu, Search, Mic, Bell, Video, User, Settings } from "lucide-react";
import toast from "react-hot-toast";

function Navbar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileSearchValue, setMobileSearchValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${search}`);
  };

  // Mobile search submit
  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (!mobileSearchValue.trim()) return;
    navigate(`/search?q=${mobileSearchValue.trim()}`);
    setMobileSearch(false);
    setMobileSearchValue("");
  };

  const handleLogout = async () => {
    try {
      setShowMenu(false);
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error("Logout failed. Try again.");
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0f0f0f] text-white border-b border-[#272727]">
      {/* LEFT */}
      <div className="flex items-center gap-4 min-w-37.5">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[#272727] rounded-full transition"
        >
          <Menu size={20} />
        </button>

        <Link
          to="/"
          className="flex items-center gap-1.5 font-bold text-[17px] tracking-tight"
        >
          <div className="bg-red-600 rounded-md w-8 h-5.5 flex items-center justify-center shrink-0">
            <svg width="16" height="11" viewBox="0 0 18 13" fill="white">
              <path d="M17.177 2.026A2.27 2.27 0 0 0 15.582.414C14.225 0 9 0 9 0S3.775 0 2.418.414A2.27 2.27 0 0 0 .823 2.026C.414 3.393.414 6.25.414 6.25s0 2.857.409 4.224a2.27 2.27 0 0 0 1.595 1.612C3.775 12.5 9 12.5 9 12.5s5.225 0 6.582-.414a2.27 2.27 0 0 0 1.595-1.612C17.586 9.107 17.586 6.25 17.586 6.25s0-2.857-.409-4.224zM7.159 8.929V3.571l4.409 2.679-4.409 2.679z" />
            </svg>
          </div>
          <span className="hidden sm:block">YouTube</span>
        </Link>
      </div>

      {/* CENTER SEARCH */}
      <div className="flex-1 flex justify-center max-w-160 mx-4">
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center w-full"
        >
          <div className="flex flex-1 border border-[#303030] rounded-l-full bg-[#121212] focus-within:border-[#1c62b9] overflow-hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 px-4 py-2 bg-transparent text-white text-[15px] outline-none placeholder-[#aaa]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#222] border border-[#303030] border-l-0 rounded-r-full hover:bg-[#3d3d3d] transition h-10 flex items-center"
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="ml-2 w-10 h-10 bg-[#272727] rounded-full hover:bg-[#3d3d3d] flex items-center justify-center transition shrink-0"
          >
            <Mic size={18} />
          </button>
        </form>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-end gap-1 min-w-37.5">
        {/* Mobile search — expands inline instead of just navigating */}
        {mobileSearch ? (
          <form
            onSubmit={handleMobileSearch}
            className="flex items-center gap-1 md:hidden"
          >
            <div className="flex border border-[#303030] rounded-l-full bg-[#121212] focus-within:border-[#1c62b9] overflow-hidden">
              <input
                autoFocus
                value={mobileSearchValue}
                onChange={(e) => setMobileSearchValue(e.target.value)}
                placeholder="Search..."
                className="w-32 sm:w-44 px-3 py-1.5 bg-transparent text-white text-sm outline-none placeholder-[#aaa]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#222] border border-[#303030] border-l-0 rounded-r-full hover:bg-[#3d3d3d] transition flex items-center"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileSearch(false);
                setMobileSearchValue("");
              }}
              className="p-2 hover:bg-[#272727] rounded-full text-[#aaa] hover:text-white transition"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </form>
        ) : (
          <button
            className="md:hidden p-2 hover:bg-[#272727] rounded-full"
            onClick={() => setMobileSearch(true)}
          >
            <Search size={20} />
          </button>
        )}

        {user ? (
          <>
            <Link
              to="/upload"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#272727] rounded-full text-sm font-medium transition"
            >
              <Video size={18} />
              <span>Create</span>
            </Link>

            <button className="relative p-2 hover:bg-[#272727] rounded-full hidden md:flex items-center justify-center">
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                3
              </span>
            </button>

            {/* Avatar dropdown */}
            <div className="relative ml-1">
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-[#3d3d3d] shrink-0"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-orange-400 to-pink-600 flex items-center justify-center text-xs font-semibold uppercase text-white">
                    {user.username?.slice(0, 2)}
                  </div>
                )}
              </div>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-xl shadow-2xl border border-[#3d3d3d] overflow-hidden z-50">
                    {/* User info header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3d3d3d]">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-orange-400 to-pink-600 flex items-center justify-center text-xs font-semibold uppercase text-white">
                            {user.username?.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.fullname || user.username}
                        </p>
                        <p className="text-xs text-[#aaa] truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to={`/channel/${user.username}`}
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                      >
                        <User size={16} className="text-[#aaa]" />
                        Your Channel
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-[#aaa]"
                        >
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        Dashboard
                      </Link>

                      <Link
                        to="/upload"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                      >
                        <Video size={16} className="text-[#aaa]" />
                        Upload Video
                      </Link>

                      {/*  Settings link added */}
                      <Link
                        to="/settings"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#3d3d3d] transition"
                      >
                        <Settings size={16} className="text-[#aaa]" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-[#3d3d3d] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-[#3d3d3d] transition"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 border border-[#3d9ae8] text-[#3d9ae8] px-4 py-1.5 rounded-full hover:bg-[#3d9ae8]/10 transition text-sm font-medium"
          >
            <User size={16} />
            <span className="hidden sm:block">Sign in</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
