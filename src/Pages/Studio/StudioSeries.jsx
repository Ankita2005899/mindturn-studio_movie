import React, { useContext, useState } from "react";
import { AuthContext } from "../../Context/UserContext";
import StudioSidebar from "./StudioSidebar";
import { useAllCustomVideos } from "../../CustomHooks/useCustomVideos";
import { useAllSeries, createSeries, deleteSeries } from "../../CustomHooks/useSeries";
import toast, { Toaster } from "react-hot-toast";

function StudioSeries() {
  const { User } = useContext(AuthContext);
  const { videos } = useAllCustomVideos();
  const { series, loading } = useAllSeries();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const toggleVideo = (id) => {
    setSelectedVideoIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setThumbnailUrl("");
    setSelectedVideoIds([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please add a title");
    if (!thumbnailUrl.trim()) return toast.error("Please paste a thumbnail image URL");
    if (selectedVideoIds.length === 0)
      return toast.error("Pick at least one video for this series");

    setIsSaving(true);
    try {
      await createSeries({
        title,
        description,
        thumbnailUrl: thumbnailUrl.trim(),
        videoIds: selectedVideoIds,
        createdByEmail: User?.email,
      });
      toast.success("Series created!");
      resetForm();
    } catch (err) {
      toast.error(err.message || "Couldn't create series");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this series? The videos themselves won't be deleted.")) return;
    setDeletingId(id);
    try {
      await deleteSeries(id);
      toast.success("Series removed");
    } catch {
      toast.error("Couldn't remove series");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Toaster />
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Library / Series</h1>
        <p className="text-gray-500 text-sm mb-8">
          Group your uploaded videos into a series — like a YouTube playlist.
          Viewers see it as one card that opens a list of episodes.
        </p>

        {videos.length === 0 ? (
          <p className="text-gray-400 text-sm mb-8">
            Upload at least one video first — series are built from videos you've
            already published.
          </p>
        ) : (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5 mb-10"
          >
            <h2 className="font-semibold text-gray-900">Create a series</h2>

            <div>
              <label className="text-sm font-medium text-gray-700">Series title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. School Life Struggle — Full Series"
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

            <div>
              <label className="text-sm font-medium text-gray-700">
                Series thumbnail URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://i.postimg.cc/xxxxxxxx/thumbnail.jpg"
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
              />
              {thumbnailUrl.trim() && (
                <img
                  src={thumbnailUrl}
                  alt="preview"
                  className="mt-3 rounded-lg w-full max-w-sm h-40 object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Pick episodes ({selectedVideoIds.length} selected)
              </label>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {videos.map((v) => (
                  <label
                    key={v.id}
                    className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVideoIds.includes(v.id)}
                      onChange={() => toggleVideo(v.id)}
                    />
                    <img
                      src={v.thumbnailUrl}
                      className="w-14 h-8 object-cover rounded"
                      alt={v.title}
                    />
                    <span className="text-gray-800">{v.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-full"
            >
              {isSaving ? "Creating…" : "Create series"}
            </button>
          </form>
        )}

        <h2 className="font-semibold text-gray-900 mb-4">
          Existing series ({series.length})
        </h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : series.length === 0 ? (
          <p className="text-gray-400 text-sm">No series created yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {series.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-3"
              >
                <img
                  src={s.thumbnailUrl}
                  className="w-28 h-16 object-cover rounded"
                  alt={s.title}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{s.title}</p>
                  <p className="text-gray-400 text-xs">
                    {s.videoIds?.length || 0} episode(s)
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

export default StudioSeries;
