import React, { useState } from "react";
import { Link } from "react-router-dom";
import StudioSidebar from "./StudioSidebar";
import {
  useAllCustomVideos,
  deleteCustomVideo,
  updateCustomVideo,
} from "../../CustomHooks/useCustomVideos";
import toast, { Toaster } from "react-hot-toast";

function StudioContent() {
  const { videos, loading } = useAllCustomVideos();
  const [deletingId, setDeletingId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deleteCustomVideo(id);
      toast.success("Video deleted");
    } catch (err) {
      toast.error("Couldn't delete video");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Toaster />
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Channel content</h1>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-400">
            Nothing uploaded yet.{" "}
            <Link to="/studio/upload" className="text-red-600 underline">
              Upload your first video
            </Link>
          </p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Video</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Likes</th>
                  <th className="px-5 py-3 font-medium">Comments</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100">
                    <td className="px-5 py-3">
                      <Link to={`/watch/${v.id}`} className="flex items-center gap-3">
                        <img
                          src={v.thumbnailUrl}
                          className="w-20 h-12 object-cover rounded"
                          alt={v.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/400x225/1a1a1a/eab308?text=MindTurn";
                          }}
                        />
                        <span className="font-medium text-gray-800 line-clamp-1">
                          {v.title}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{v.views || 0}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {v.likes?.length || 0}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {v.comments?.length || 0}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingVideo(v)}
                        className="text-blue-600 hover:underline text-xs font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        {deletingId === v.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
        />
      )}
    </div>
  );
}

function EditVideoModal({ video, onClose }) {
  const [title, setTitle] = useState(video.title || "");
  const [description, setDescription] = useState(video.description || "");
  const [category, setCategory] = useState(video.category || "General");
  const [youtubeUrlOrId, setYoutubeUrlOrId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnailUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCustomVideo(video.id, {
        title,
        description,
        category,
        youtubeUrlOrId: youtubeUrlOrId.trim() || undefined,
        thumbnailUrl,
      });
      toast.success("Video updated");
      onClose();
    } catch (err) {
      toast.error(err.message || "Couldn't update video");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit video</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
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
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            >
              <option>General</option>
              <option>Motivational</option>
              <option>Education</option>
              <option>Entertainment</option>
              <option>Shorts</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              New YouTube link (leave blank to keep current video)
            </label>
            <input
              type="text"
              value={youtubeUrlOrId}
              onChange={(e) => setYoutubeUrlOrId(e.target.value)}
              placeholder="https://youtu.be/xxxxxxxxxxx"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
            />
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt="preview"
                className="mt-2 rounded-lg w-full h-32 object-cover"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-full"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudioContent;
