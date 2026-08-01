import React, { useContext, useState } from "react";
import { AuthContext } from "../../Context/UserContext";
import StudioSidebar from "./StudioSidebar";
import { useAllCustomVideos } from "../../CustomHooks/useCustomVideos";
import {
  useFeaturedBanner,
  addFeaturedSlide,
  deleteFeaturedSlide,
} from "../../CustomHooks/useFeaturedBanner";
import toast, { Toaster } from "react-hot-toast";

function StudioFeatured() {
  const { User } = useContext(AuthContext);
  const { videos } = useAllCustomVideos();
  const { slides, loading } = useFeaturedBanner();

  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // When admin picks one of their own uploaded videos, auto-fill the fields
  const handlePickVideo = (id) => {
    setSelectedVideoId(id);
    const v = videos.find((vid) => vid.id === id);
    if (v) {
      setTitle(v.title);
      setDescription(v.description);
      setImageUrl(v.thumbnailUrl);
    }
  };

  const resetForm = () => {
    setSelectedVideoId("");
    setTitle("");
    setDescription("");
    setImageUrl("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please add a title");
    if (!imageUrl.trim()) return toast.error("Please add an image URL, or pick a video");

    setIsSaving(true);
    try {
      await addFeaturedSlide({
        title,
        description,
        imageUrl,
        linkVideoId: selectedVideoId || null,
        addedByEmail: User?.email,
      });
      toast.success("Added to home page banner!");
      resetForm();
    } catch (err) {
      toast.error(err.message || "Couldn't add slide");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteFeaturedSlide(id);
      toast.success("Removed");
    } catch {
      toast.error("Couldn't remove");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Toaster />
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Home page banner
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Pick 5–6 thumbnails to feature at the top of the home page. They
          auto-slide every 5 seconds. This only affects what viewers see —
          it's controlled from here only.
        </p>

        {/* Add new slide */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5 mb-10"
        >
          <h2 className="font-semibold text-gray-900">Add a slide</h2>

          {videos.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Feature one of your uploaded videos (optional shortcut)
              </label>
              <select
                value={selectedVideoId}
                onChange={(e) => handlePickVideo(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="">— choose a video, or fill in manually below —</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Image URL (thumbnail shown on the banner)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="mt-3 rounded-lg w-full max-w-sm h-40 object-cover"
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-full"
          >
            {isSaving ? "Adding…" : "Add to banner"}
          </button>
        </form>

        {/* Current slides */}
        <h2 className="font-semibold text-gray-900 mb-4">
          Current banner slides ({slides.length})
        </h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : slides.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No slides yet — the home page will show a random trending movie
            until you add some here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {slides.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-3"
              >
                <img
                  src={s.imageUrl}
                  className="w-28 h-16 object-cover rounded"
                  alt={s.title}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{s.title}</p>
                  <p className="text-gray-400 text-xs line-clamp-1">
                    {s.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                >
                  {deletingId === s.id ? "Removing…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioFeatured;
