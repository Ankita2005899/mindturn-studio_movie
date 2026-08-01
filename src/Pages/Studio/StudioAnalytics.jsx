import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import StudioSidebar from "./StudioSidebar";
import { useAllCustomVideos, useSiteAnalytics } from "../../CustomHooks/useCustomVideos";

// Merge every video's viewLog/watchLog into one per-day series
function buildChartData(videos, selectedId) {
  const relevant =
    selectedId === "all" ? videos : videos.filter((v) => v.id === selectedId);

  const byDate = {};

  relevant.forEach((video) => {
    (video.viewLog || []).forEach(({ date, count }) => {
      byDate[date] = byDate[date] || { date, views: 0, watchMinutes: 0 };
      byDate[date].views += count;
    });
    (video.watchLog || []).forEach(({ date, seconds }) => {
      byDate[date] = byDate[date] || { date, views: 0, watchMinutes: 0 };
      byDate[date].watchMinutes += Math.round((seconds || 0) / 60);
    });
  });

  return Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1));
}

function StudioAnalytics() {
  const { videos, loading } = useAllCustomVideos();
  const { data: siteData, loading: siteLoading } = useSiteAnalytics();
  const [selectedId, setSelectedId] = useState("all");

  const chartData = useMemo(
    () => buildChartData(videos, selectedId),
    [videos, selectedId]
  );

  const totals = useMemo(() => {
    const relevant =
      selectedId === "all" ? videos : videos.filter((v) => v.id === selectedId);
    return {
      views: relevant.reduce((s, v) => s + (v.views || 0), 0),
      watchHours: (
        relevant.reduce((s, v) => s + (v.watchTimeSeconds || 0), 0) / 3600
      ).toFixed(1),
      likes: relevant.reduce((s, v) => s + (v.likes?.length || 0), 0),
      comments: relevant.reduce((s, v) => s + (v.comments?.length || 0), 0),
    };
  }, [videos, selectedId]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <StudioSidebar />

      <div className="flex-1 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Channel analytics</h1>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          >
            <option value="all">All videos</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading analytics…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Views" value={totals.views} />
              <StatCard label="Watch time (hrs)" value={totals.watchHours} />
              <StatCard label="Likes" value={totals.likes} />
              <StatCard label="Comments" value={totals.comments} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Views &amp; watch time over time
              </h2>
              {chartData.length === 0 ? (
                <p className="text-gray-400 text-sm py-10 text-center">
                  No data yet — once people watch your videos, this graph fills
                  in automatically.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#dc2626"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="watchMinutes"
                      stroke="#2563eb"
                      strokeWidth={2}
                      name="Watch time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Site-wide totals */}
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 mb-4">
                Whole website — all-time
              </h2>
              {siteLoading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard label="Total site views" value={siteData?.totalViews || 0} />
                  <StatCard label="Total site likes" value={siteData?.totalLikes || 0} />
                  <StatCard label="Total videos" value={siteData?.totalVideos || 0} />
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Category performance — which type of videos people love
              </h2>
              {!siteData?.categories || Object.keys(siteData.categories).length === 0 ? (
                <p className="text-gray-400 text-sm py-6 text-center">
                  No category data yet — this fills in as people watch and like videos.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-gray-500 text-left border-b">
                    <tr>
                      <th className="py-2 font-medium">Category</th>
                      <th className="py-2 font-medium">Videos</th>
                      <th className="py-2 font-medium">Views</th>
                      <th className="py-2 font-medium">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(siteData.categories)
                      .sort((a, b) => (b[1].views || 0) - (a[1].views || 0))
                      .map(([name, stats]) => (
                        <tr key={name} className="border-b last:border-0">
                          <td className="py-2.5 font-medium text-gray-800">{name}</td>
                          <td className="py-2.5 text-gray-600">{stats.videoCount || 0}</td>
                          <td className="py-2.5 text-gray-600">{stats.views || 0}</td>
                          <td className="py-2.5 text-gray-600">{stats.likes || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default StudioAnalytics;
