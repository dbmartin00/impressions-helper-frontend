import { useEffect, useMemo, useState } from "react";
import HeatMap from "react-heatmap-grid";

// Read API URL from environment variable
const API_URL = process.env.REACT_APP_HARNESS_IMPRESSIONS_HELPER;

export default function ImpressionsDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setRows(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Normalize data
  const normalized = useMemo(() =>
    rows.map(r => ({
      splitName: r.splitName,
      impressionDate: r.impression_date,
      count: Number(r.impression_count)
    })), [rows]);

  // Unique flags and dates
  const flags = useMemo(() => Array.from(new Set(normalized.map(r => r.splitName))).sort(), [normalized]);
  const uniqueDays = useMemo(() => Array.from(new Set(normalized.map(r => r.impressionDate))).sort(), [normalized]);

  // Metrics
  const totalImpressions = useMemo(() => normalized.reduce((s, r) => s + r.count, 0), [normalized]);
  const totalsByFlag = useMemo(() => {
    const map = new Map();
    normalized.forEach(r => map.set(r.splitName, (map.get(r.splitName) || 0) + r.count));
    return map;
  }, [normalized]);
  const topFlag = useMemo(() => {
    if (totalsByFlag.size === 0) return null;
    return Array.from(totalsByFlag.entries())
      .sort((a, b) => b[1] - a[1])[0];
  }, [totalsByFlag]);

  // Build 2D array for HeatMap
  const dataMatrix = useMemo(() =>
    flags.map(flag =>
      uniqueDays.map(date => {
        const record = normalized.find(r => r.splitName === flag && r.impressionDate === date);
        return record ? record.count : 0;
      })
    ), [flags, uniqueDays, normalized]
  );

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-6">Impression Analytics</h1>

      {/* Top metrics row */}
      <div className="flex flex-wrap gap-6 mb-8">
        {/* Unique Days */}
        <div className="bg-white shadow rounded-lg p-4 min-w-[200px] flex flex-col">
          <span className="font-bold text-gray-700">Unique Days Measured</span>
          <span className="text-lg font-semibold mt-1">{uniqueDays.length}</span>
        </div>

        {/* Total Impressions */}
        <div className="bg-white shadow rounded-lg p-4 min-w-[200px] flex flex-col">
          <span className="font-bold text-gray-700">Total Impressions</span>
          <span className="text-lg font-semibold mt-1">{totalImpressions.toLocaleString()}</span>
        </div>

        {/* Top Flag */}
        {topFlag && (
          <div className="bg-white shadow rounded-lg p-4 min-w-[200px] flex flex-col">
            <span className="font-bold text-gray-700">Top Flag</span>
            <span className="text-lg font-semibold mt-1 flex justify-between">
              <span className="truncate">{topFlag[0]}</span>
              <span className="font-mono">{topFlag[1].toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Heatmap */}
      <h2 className="text-xl font-semibold mb-3">Impressions Heat Map</h2>
      <p className="text-sm text-gray-600 mb-4">
        Rows = flags, Columns = dates. Blue = impressions, white = zero.
      </p>

      <div className="overflow-auto border border-gray-300 rounded-md">
        <HeatMap
          xLabels={uniqueDays.map(d => {
            const dt = new Date(d);
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const dd = String(dt.getDate()).padStart(2, "0");
            const yy = String(dt.getFullYear()).slice(-2);
            return `${mm}-${dd}-${yy}`;
          })}
          yLabels={flags}
          data={dataMatrix}
          squares
          height={30}
          xLabelWidth={200}
          yLabelWidth={200}
          cellStyle={(background, value) => ({
            background: value > 0 ? `rgba(37,99,235, ${Math.min(1, value / 50)})` : "#fff",
            color: value > 0 ? "#fff" : "#000",
            fontSize: "0.8rem"
          })}
          cellRender={value => value > 0 ? <span>{value}</span> : null}
        />
      </div>
    </div>
  );
}

