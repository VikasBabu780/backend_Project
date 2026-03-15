import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  changePassword,
} from "../api/authAPI";
import toast from "react-hot-toast";

// ─── Section Card ───────────
const SectionCard = ({ title, description, children }) => (
  <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl overflow-hidden">
    <div className="px-5 sm:px-6 py-4 border-b border-[#272727]">
      <h2 className="text-white font-medium">{title}</h2>
      {description && (
        <p className="text-[#aaa] text-xs mt-0.5">{description}</p>
      )}
    </div>
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </div>
);

// ─── Main Settings ─────────────
const Settings = () => {
  const { user, login } = useContext(AuthContext);

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password form ──
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // ── Avatar ──
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarRef = useRef(null);

  // ── Cover image ──
  const [coverPreview, setCoverPreview] = useState(user?.coverimage || null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const coverRef = useRef(null);

  // ─── Handlers ───────────────

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Save profile details
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.fullname && !profileForm.email) {
      toast.error("At least one field is required");
      return;
    }
    try {
      setProfileLoading(true);
      const updated = await updateAccountDetails(profileForm);
      login({ ...user, ...updated });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Save avatar
  const handleAvatarSave = async () => {
    if (!avatarFile) {
      toast.error("Please select a new avatar first");
      return;
    }
    try {
      setAvatarLoading(true);
      const data = new FormData();
      data.append("avatar", avatarFile);
      const updated = await updateUserAvatar(data);
      login({ ...user, avatar: updated.avatar });
      setAvatarFile(null);
      toast.success("Avatar updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Save cover image
  const handleCoverSave = async () => {
    if (!coverFile) {
      toast.error("Please select a new cover image first");
      return;
    }
    try {
      setCoverLoading(true);
      const data = new FormData();
      data.append("coverimage", coverFile);
      const updated = await updateUserCoverImage(data);
      login({ ...user, coverimage: updated.coverimage });
      setCoverFile(null);
      toast.success("Cover image updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update cover image");
    } finally {
      setCoverLoading(false);
    }
  };

  // Save password
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({ oldPassword, newPassword });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-[#aaa] text-sm mt-1">
            Manage your account and channel settings
          </p>
        </div>

        {/* ── Profile pictures ──────────────── */}
        <SectionCard
          title="Profile pictures"
          description="Update your avatar and channel cover image"
        >
          {/* Cover image */}
          <div className="mb-5">
            <p className="text-sm text-[#aaa] mb-2">Cover image</p>
            <div
              className="relative w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-[#272727] cursor-pointer group"
              onClick={() => coverRef.current?.click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#555]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <p className="text-sm">Click to upload cover image</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Change cover
                </div>
              </div>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
            {coverFile && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-[#aaa] text-xs truncate">{coverFile.name}</p>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(user?.coverimage || null);
                    }}
                    className="text-xs text-[#aaa] hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCoverSave}
                    disabled={coverLoading}
                    className="px-3 py-1 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-xs font-medium rounded-full transition"
                  >
                    {coverLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div>
            <p className="text-sm text-[#aaa] mb-2">Avatar</p>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-[#272727] cursor-pointer group shrink-0"
                onClick={() => avatarRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold uppercase bg-linear-to-br from-orange-400 to-pink-600">
                    {user?.username?.slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-white text-sm font-medium">
                  {user?.fullname || user?.username}
                </p>
                <p className="text-[#aaa] text-xs">@{user?.username}</p>
                {avatarFile ? (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(user?.avatar || null);
                      }}
                      className="text-xs text-[#aaa] hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAvatarSave}
                      disabled={avatarLoading}
                      className="px-3 py-1 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 text-white text-xs font-medium rounded-full transition"
                    >
                      {avatarLoading ? "Saving..." : "Save avatar"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="text-xs text-[#3d9ae8] hover:underline mt-1 text-left"
                  >
                    Change avatar
                  </button>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Account details ──────────────── */}
        <SectionCard
          title="Account details"
          description="Update your name and email address"
        >
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#aaa]">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={profileForm.fullname}
                  onChange={handleProfileChange}
                  placeholder="Your full name"
                  className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#aaa]">Username</label>
                <input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="bg-[#121212] border border-[#303030] text-[#555] rounded-lg px-3 py-2.5 text-sm outline-none cursor-not-allowed"
                />
                <p className="text-[#555] text-xs">
                  Username cannot be changed
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">Email</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="your@email.com"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition flex items-center gap-2"
              >
                {profileLoading ? (
                  <>
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
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Change password ─────────────── */}
        <SectionCard
          title="Change password"
          description="Use a strong password with at least 6 characters"
        >
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">Current password</label>
              <input
                type={showPasswords ? "text" : "password"}
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">New password</label>
              <input
                type={showPasswords ? "text" : "password"}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#aaa]">
                Confirm new password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="bg-[#121212] border border-[#303030] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555]"
              />
            </div>

            {/* Show/hide passwords toggle */}
            <button
              type="button"
              onClick={() => setShowPasswords((p) => !p)}
              className="flex items-center gap-2 text-xs text-[#aaa] hover:text-white transition w-fit"
            >
              {showPasswords ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                  Hide passwords
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  Show passwords
                </>
              )}
            </button>

            {/* Password strength indicator */}
            {passwordForm.newPassword && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = Math.min(
                      Math.floor(passwordForm.newPassword.length / 3),
                      4,
                    );
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strength <= 1
                              ? "bg-red-500"
                              : strength <= 2
                                ? "bg-yellow-500"
                                : strength <= 3
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                            : "bg-[#272727]"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-[#aaa]">
                  {passwordForm.newPassword.length < 3
                    ? "Too short"
                    : passwordForm.newPassword.length < 6
                      ? "Weak"
                      : passwordForm.newPassword.length < 9
                        ? "Fair"
                        : passwordForm.newPassword.length < 12
                          ? "Good"
                          : "Strong"}
                </p>
              </div>
            )}

            {/* Confirm match indicator */}
            {passwordForm.confirmPassword && (
              <p
                className={`text-xs flex items-center gap-1.5 ${
                  passwordForm.newPassword === passwordForm.confirmPassword
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {passwordForm.newPassword === passwordForm.confirmPassword ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Passwords match
                  </>
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                    Passwords do not match
                  </>
                )}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  passwordLoading ||
                  !passwordForm.oldPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
                className="px-6 py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition flex items-center gap-2"
              >
                {passwordLoading ? (
                  <>
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
                    Changing...
                  </>
                ) : (
                  "Change password"
                )}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Account info ────────────── */}
        <SectionCard title="Account info">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-[#272727]">
              <span className="text-[#aaa] text-sm">Username</span>
              <span className="text-white text-sm font-medium">
                @{user?.username}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#272727]">
              <span className="text-[#aaa] text-sm">Email</span>
              <span className="text-white text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#aaa] text-sm">Full name</span>
              <span className="text-white text-sm">{user?.fullname}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Settings;
