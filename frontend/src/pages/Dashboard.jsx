import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import NeuralFace3D from "../components/NeuralFace3D";
import { getMoodAnalytics } from "../services/analyticsService";
import "./dashboard.css";

const COLORS = {
  Happy: "#22c55e",
  Sad: "#3b82f6",
  Anxious: "#f59e0b",
  Neutral: "#64748b",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const res = await getMoodAnalytics();
        if (mounted) {
          setAnalyticsData(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ color: COLORS[data.name] }}>{data.name}</p>
          <p className="value">{payload[0].value} messages</p>
        </div>
      );
    }
    return null;
  };

  const dominantMood = () => {
    if (!analyticsData || !analyticsData.distribution.length) return "N/A";
    const sorted = [...analyticsData.distribution].sort((a, b) => b.value - a.value);
    return sorted[0].name;
  };

  return (
    <div className="dashboard-root">
      {/* Background */}
      <div className="dashboard-bg-layer">
        <NeuralFace3D />
      </div>
      <div className="dashboard-bg-overlay" />

      <div className="dashboard-container">
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h2>Mind Analytics</h2>
            <p>Your emotional reflections over time</p>
          </div>
          <button className="dashboard-back-btn" onClick={() => navigate("/chat")}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Chat
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="dashboard-content">
          
          {loading ? (
            <div className="loading-analytics">
              <div className="typing-dots" style={{ marginBottom: "16px" }}>
                <span></span><span></span><span></span>
              </div>
              Analyzing emotional patterns...
            </div>
          ) : (
            <>
              <div className="dash-stats">
                <div className="stat-card">
                  <div className="stat-card-title">Messages Analyzed</div>
                  <div className="stat-card-value">
                    {analyticsData?.totalMessagesAnalyzed || 0}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Dominant Mood</div>
                  <div className="stat-card-value stat-card-highlight">
                    {dominantMood()}
                  </div>
                </div>
              </div>

              <div className="dash-chart-container">
                <h3 className="chart-title">Mood Frequency</h3>
                
                {analyticsData?.distribution?.length > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.distribution} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.3)" 
                          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13 }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.3)" 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 13 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                          {analyticsData.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Neutral} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="loading-analytics">
                    Not enough data yet. Try expressing yourself in the chat more.
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
