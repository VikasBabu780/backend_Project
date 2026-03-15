import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { publishVideo } from "../api/videoAPI";
import toast from "react-hot-toast";

const Upload = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleVideoSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video must be under 500MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleVideoSelect(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    try {
      setUploading(true);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) { clearInterval(interval); return 90; }
          return prev + 10;
        });
      }, 500);

      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("videoFile", videoFile);
      if (thumbnail) data.append("thumbnail", thumbnail);

      const video = await publishVideo(data);

      clearInterval(interval);
      setProgress(100);

      toast.success("Video uploaded successfully!");
      navigate(`/video/${video._id}`);
    } catch (err) {
      toast.error(err.message || "Upload failed. Try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // ─── STEP 1 — File picker ──────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-4 py-10 overflow-x-hidden">
        <div className="w-full max-w-xl">

          <h1 className="text-2xl font-semibold text-white mb-1">Upload video</h1>
          <p className="text-[#aaa] text-sm mb-8">Share your video with the world</p>

          {/* ✅ Fix — px-6 py-10 on mobile, p-12 on sm+ */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => videoInputRef.current?.click()}
            className={`
              w-full border-2 border-dashed rounded-2xl
              px-6 py-10 sm:p-12
              flex flex-col items-center justify-center
              cursor-pointer transition-all duration-200 text-center
              ${dragging
                ? "border-[#1c62b9] bg-[#1c62b9]/10"
                : "border-[#303030] hover:border-[#555] bg-[#1a1a1a] hover:bg-[#222]"
              }
            `}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#272727] flex items-center justify-center mb-4 shrink-0">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#aaa">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1 text-sm sm:text-base">
              {dragging ? "Drop your video here" : "Drag and drop your video"}
            </p>
            <p className="text-[#aaa] text-xs sm:text-sm mb-6">
              or click to browse files
            </p>
            <button
              type="button"
              className="px-5 py-2 sm:px-6 sm:py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] text-white text-sm font-medium rounded-full transition"
            >
              Select file
            </button>
            <p className="text-[#555] text-xs mt-4">MP4, MOV, AVI up to 500MB</p>
          </div>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleVideoSelect(e.target.files[0])}
          />

        </div>
      </div>
    );
  }

  // ─── STEP 2 — Details form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Video details</h1>
            <p className="text-[#aaa] text-sm mt-0.5">Fill in your video information</p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setVideoFile(null);
              setVideoPreview(null);
            }}
            className="text-[#aaa] hover:text-white text-sm transition flex items-center gap-1 shrink-0 ml-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            <span className="hidden sm:block">Change video</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — form */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#aaa]">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add a title that describes your video"
                maxLength={100}
                disabled={uploading}
                className="bg-[#1a1a1a] border border-[#303030] text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555] disabled:opacity-50"
              />
              <p className="text-[#555] text-xs text-right">
                {formData.title.length}/100
              </p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#aaa]">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell viewers about your video"
                rows={5}
                maxLength={500}
                disabled={uploading}
                className="bg-[#1a1a1a] border border-[#303030] text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1c62b9] transition placeholder-[#555] resize-none disabled:opacity-50"
              />
              <p className="text-[#555] text-xs text-right">
                {formData.description.length}/500
              </p>
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#aaa]">Thumbnail (optional)</label>
              <div
                onClick={() => !uploading && thumbnailInputRef.current?.click()}
                className={`
                  relative w-full aspect-video rounded-xl overflow-hidden
                  border border-dashed border-[#303030] hover:border-[#555]
                  transition cursor-pointer bg-[#1a1a1a]
                  ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {thumbnailPreview ? (
                  <>
                    <img
                      src={thumbnailPreview}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Change thumbnail</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#aaa]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                    <p className="text-sm">Click to upload thumbnail</p>
                    <p className="text-xs text-[#555]">JPG, PNG recommended</p>
                  </div>
                )}
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
            </div>

          </div>

          {/* RIGHT — video preview */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <p className="text-sm text-[#aaa] mb-2">Preview</p>
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#272727]">
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            {videoFile && (
              <div className="mt-3 bg-[#1a1a1a] border border-[#272727] rounded-xl p-3">
                <p className="text-white text-xs font-medium truncate">{videoFile.name}</p>
                <p className="text-[#aaa] text-xs mt-0.5">
                  {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm text-[#aaa]">Uploading to Cloudinary...</p>
              <p className="text-sm text-white font-medium">{progress}%</p>
            </div>
            <div className="w-full h-1.5 bg-[#272727] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1c62b9] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={uploading}
            className="px-6 py-2.5 bg-[#272727] hover:bg-[#3d3d3d] disabled:opacity-50 text-white text-sm font-medium rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !formData.title.trim() || !formData.description.trim()}
            className="px-8 py-2.5 bg-[#1c62b9] hover:bg-[#1a56a0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </>
            ) : "Publish video"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Upload;