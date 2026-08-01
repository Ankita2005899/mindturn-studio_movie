import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/UserContext";
import StudioSidebar from "./StudioSidebar";
import { uploadCustomVideo, extractYoutubeId } from "../../CustomHooks/useCustomVideos";
import toast, { Toaster } from "react-hot-toast";

function StudioUpload() {
  const { User } = useContext(AuthContext);
  const navigate = useNavigate();

  const [youtubeUrlOrId, setYoutubeUrlOrId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [isUploading, setIsUploading] = useState(false);

  const previewId = extractYoutubeId(youtubeUrlOrId);

  const resetForm = () => {
    setYoutubeUrlOrId("");
    setThumbnailUrl("");
    setTitle("");
    setDescription("");
    setCategory("General");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please add a title");
    if (!previewId) return toast.error("Paste a valid YouTube link or video ID");
    if (!thumbnailUrl.trim()) return toast.error("Please paste a thumbnail image URL");

    setIsUploading(true);
    try {
      const id = await uploadCustomVideo({
        title,
        description,
        category,
        youtubeUrlOrId,
        thumbnailUrl,
        uploaderEmail: User?.email,
      });
      toast.success("Video published!");
      resetForm();
      navigate(`/watch/${id}`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Toaster />
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Upload video</h1>
        <p className="text-gray-500 text-sm mb-8">
          Step 1: upload your video as <b>Unlisted</b> on YouTube, and paste
          the link below. Step 2: paste a thumbnail image link (you can
          upload an image to a free site like{" "}
          <a
            href="https://postimages.org"
            target="_blank"
            rel="noreferrer"
            className="text-red-600 underline"
          >
            postimages.org
          </a>{" "}
          and copy the "Direct link" it gives you).
        </p>

        <form
          onSubmit={handleUpload}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">
              YouTube link or video ID
            </label>
            <input
              type="text"
              value={youtubeUrlOrId}
              onChange={(e) => setYoutubeUrlOrId(e.target.value)}
              placeholder="https://youtu.be/xxxxxxxxxxx"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {previewId && (
              <p className="text-xs text-green-600 mt-1">✓ Valid YouTube link</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Thumbnail image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://i.postimg.cc/xxxxxxxx/thumbnail.jpg"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {thumbnailUrl.trim() && (
              <img
                src={thumbnailUrl}
                alt="thumbnail preview"
                className="mt-3 rounded-lg w-full max-w-sm h-40 object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell viewers about this video"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option>General</option>
              <option>Motivational</option>
              <option>Education</option>
              <option>Entertainment</option>
              <option>Shorts</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-full mt-2"
          >
            {isUploading ? "Publishing…" : "Publish to MindTurn"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudioUpload;
