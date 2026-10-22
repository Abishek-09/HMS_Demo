import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import Card from "./Card";
import { formatCurrency } from "../utils/format";

export default function DailyReportChart({ visits = [], bills = [] }) {
  // Active metric: "visits" | "revenue" | "both"
  const [activeMetric, setActiveMetric] = useState("visits");
  // Hovered day index (0..6) or null
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate 7-day data (from 6 days ago up to today)
  const chartData = useMemo(() => {
    const list = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayDateStr = d.toDateString();
      const isToday = i === 0;

      // Filter visits for this day
      const dayVisits = visits.filter((v) => {
        const vd = new Date(v.dateTime || v.createdAt);
        return vd.toDateString() === dayDateStr;
      });

      // Filter bills for this day
      const dayBills = bills.filter((b) => {
        const bd = new Date(b.date || b.createdAt);
        return bd.toDateString() === dayDateStr;
      });

      const dayRevenue = dayBills
        .filter((b) => b.status === "Paid")
        .reduce((sum, b) => sum + (Number(b.total) || 0), 0);

      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });

      list.push({
        index: 6 - i,
        date: d,
        dateStr: dayDateStr,
        weekday,
        dayNum,
        label: isToday ? "Today" : `${weekday} ${dayNum}`,
        fullDate: `${weekday}, ${dayNum} ${monthStr}`,
        visits: dayVisits.length,
        revenue: dayRevenue,
        billsCount: dayBills.length,
        isToday,
      });
    }
    return list;
  }, [visits, bills]);

  // Aggregate field statistics
  const stats = useMemo(() => {
    const totalVisits = chartData.reduce((acc, d) => acc + d.visits, 0);
    const totalRevenue = chartData.reduce((acc, d) => acc + d.revenue, 0);
    const dailyAvgVisits = (totalVisits / 7).toFixed(1);

    // Peak day
    let peakDay = chartData[0];
    for (const d of chartData) {
      if (d.visits > (peakDay ? peakDay.visits : 0)) {
        peakDay = d;
      }
    }

    const avgRevenuePerVisit =
      totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0;

    return {
      totalVisits,
      totalRevenue,
      dailyAvgVisits,
      peakDay,
      avgRevenuePerVisit,
    };
  }, [chartData]);

  // SVG dimensions & coordinate calculations
  const svgWidth = 620;
  const svgHeight = 190;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 32;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Max scale calculations
  const maxVisitsRaw = Math.max(...chartData.map((d) => d.visits), 1);
  const maxVisits = Math.max(4, Math.ceil(maxVisitsRaw * 1.25));

  const maxRevenueRaw = Math.max(...chartData.map((d) => d.revenue), 500);
  const maxRevenue = Math.max(2000, Math.ceil(maxRevenueRaw / 500) * 500);

  // Compute point coordinates
  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const x = paddingLeft + (i / 6) * plotWidth;

      // Y for visits
      const visitsRatio = d.visits / maxVisits;
      const yVisits = paddingTop + (1 - visitsRatio) * plotHeight;

      // Y for revenue
      const revenueRatio = d.revenue / maxRevenue;
      const yRevenue = paddingTop + (1 - revenueRatio) * plotHeight;

      return {
        ...d,
        x,
        yVisits,
        yRevenue,
      };
    });
  }, [chartData, maxVisits, maxRevenue, plotWidth, plotHeight]);

  // Cubic bezier curve path generator
  const createCurvedPath = (pts, key = "yVisits") => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x.toFixed(1)} ${pts[0][key].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1[key] + (p2[key] - p0[key]) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2[key] - (p3[key] - p1[key]) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2[key].toFixed(1)}`;
    }
    return path;
  };

  const visitsLinePath = useMemo(() => createCurvedPath(points, "yVisits"), [points]);
  const revenueLinePath = useMemo(() => createCurvedPath(points, "yRevenue"), [points]);

  const visitsAreaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = paddingTop + plotHeight;
    return `${visitsLinePath} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;
  }, [visitsLinePath, points, plotHeight]);

  const revenueAreaPath = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = paddingTop + plotHeight;
    return `${revenueLinePath} L ${points[points.length - 1].x.toFixed(1)} ${bottomY} L ${points[0].x.toFixed(1)} ${bottomY} Z`;
  }, [revenueLinePath, points, plotHeight]);

  // Selected hover point
  const currentHover = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <Card
      title="Daily Activity & Clinical Report"
      subtitle="7-day moving trend of patient consultations and revenue performance"
      action={
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "var(--color-bg)",
            borderRadius: "var(--radius-control)",
            padding: "3px",
            border: "1px solid var(--color-border)",
            gap: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMetric("visits")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: activeMetric === "visits" ? "600" : "500",
              backgroundColor: activeMetric === "visits" ? "var(--color-surface)" : "transparent",
              color: activeMetric === "visits" ? "var(--color-primary)" : "var(--color-text-secondary)",
              border: "none",
              boxShadow: activeMetric === "visits" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Consultations
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: activeMetric === "revenue" ? "600" : "500",
              backgroundColor: activeMetric === "revenue" ? "var(--color-surface)" : "transparent",
              color: activeMetric === "revenue" ? "var(--color-primary)" : "var(--color-text-secondary)",
              border: "none",
              boxShadow: activeMetric === "revenue" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Collections (₹)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("both")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: activeMetric === "both" ? "600" : "500",
              backgroundColor: activeMetric === "both" ? "var(--color-surface)" : "transparent",
              color: activeMetric === "both" ? "var(--color-primary)" : "var(--color-text-secondary)",
              border: "none",
              boxShadow: activeMetric === "both" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Combined
          </button>
        </div>
      }
      padding="24px"
    >
      {/* 4 FIELD CARDS (New Field Cards Row) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {/* Field Card 1: 7-Day Consultations */}
        <div
          onClick={() => setActiveMetric("visits")}
          style={{
            backgroundColor: activeMetric === "visits" ? "var(--color-primary-tint)" : "var(--color-bg)",
            border: activeMetric === "visits" ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          title="Click to view Consultations trend"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              7-Day Total
            </span>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "rgba(36, 87, 68, 0.12)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "26px",
                color: "var(--color-text)",
              }}
            >
              {stats.totalVisits}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "var(--color-primary)",
              }}
            >
              patients
            </span>
          </div>
        </div>

        {/* Field Card 2: Daily Average */}
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              Daily Average
            </span>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "rgba(36, 87, 68, 0.12)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "26px",
                color: "var(--color-text)",
              }}
            >
              {stats.dailyAvgVisits}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              pts / day
            </span>
          </div>
        </div>

        {/* Field Card 3: Peak Volume Day */}
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              Peak Day
            </span>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "2px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                lineHeight: "26px",
                color: "var(--color-text)",
              }}
            >
              {stats.peakDay ? stats.peakDay.label : "—"}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "var(--color-accent-text)",
              }}
            >
              ({stats.peakDay ? stats.peakDay.visits : 0} pts)
            </span>
          </div>
        </div>

        {/* Field Card 4: 7-Day Collections */}
        <div
          onClick={() => setActiveMetric("revenue")}
          style={{
            backgroundColor: activeMetric === "revenue" ? "var(--color-primary-tint)" : "var(--color-bg)",
            border: activeMetric === "revenue" ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
            borderRadius: "var(--radius-control)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
          title="Click to view Collections trend"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--color-text-secondary)",
              }}
            >
              Weekly Revenue
            </span>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "rgba(36, 87, 68, 0.12)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IndianRupee size={14} strokeWidth={2.2} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "26px",
                color: "var(--color-text)",
              }}
            >
              {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* SVG LINE CHART */}
      <div
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: "#FAFAF7",
          borderRadius: "var(--radius-control)",
          border: "1px solid var(--color-border)",
          padding: "16px 12px 12px",
          boxSizing: "border-box",
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "auto", overflow: "visible", display: "block" }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Primary Gradient for Patient Consultations */}
            <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#245744" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#245744" stopOpacity="0.0" />
            </linearGradient>

            {/* Amber/Secondary Gradient for Revenue */}
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B38F00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B38F00" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines (4 levels: 0%, 33%, 66%, 100%) */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = paddingTop + pct * plotHeight;
            const visitVal = Math.round((1 - pct) * maxVisits);
            const revVal = Math.round((1 - pct) * maxRevenue);

            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--color-text-secondary)"
                  fontWeight="500"
                  fontFamily="var(--font-sans)"
                  className="tabular-nums"
                >
                  {activeMetric === "revenue" ? `₹${revVal}` : visitVal}
                </text>
              </g>
            );
          })}

          {/* Fill Area & Line for Revenue (when "revenue" or "both") */}
          {(activeMetric === "revenue" || activeMetric === "both") && (
            <g>
              <path d={revenueAreaPath} fill="url(#revenueGrad)" />
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#B38F00"
                strokeWidth={activeMetric === "revenue" ? "2.5" : "2"}
                strokeDasharray={activeMetric === "both" ? "5 4" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Fill Area & Line for Patient Consultations (when "visits" or "both") */}
          {(activeMetric === "visits" || activeMetric === "both") && (
            <g>
              <path d={visitsAreaPath} fill="url(#visitsGrad)" />
              <path
                d={visitsLinePath}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Vertical Guide & Hover Halo when hovering */}
          {currentHover && (
            <g>
              <line
                x1={currentHover.x}
                y1={paddingTop}
                x2={currentHover.x}
                y2={paddingTop + plotHeight}
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </g>
          )}

          {/* Data Points (Circles) */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Invisible hover trigger column for easy touching/mouse interaction */}
                <rect
                  x={p.x - plotWidth / 12}
                  y={paddingTop}
                  width={plotWidth / 6}
                  height={plotHeight + paddingBottom}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* Revenue Circle */}
                {(activeMetric === "revenue" || activeMetric === "both") && (
                  <circle
                    cx={p.x}
                    cy={p.yRevenue}
                    r={isHovered ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#B38F00"
                    strokeWidth={isHovered ? 3 : 2}
                    style={{
                      transition: "r 0.15s ease, stroke-width 0.15s ease",
                      filter: isHovered ? "drop-shadow(0 2px 4px rgba(179,143,0,0.4))" : "none",
                    }}
                  />
                )}

                {/* Visits Circle */}
                {(activeMetric === "visits" || activeMetric === "both") && (
                  <circle
                    cx={p.x}
                    cy={p.yVisits}
                    r={isHovered ? 6.5 : 4.5}
                    fill="#FFFFFF"
                    stroke="var(--color-primary)"
                    strokeWidth={isHovered ? 3 : 2.5}
                    style={{
                      transition: "r 0.15s ease, stroke-width 0.15s ease",
                      filter: isHovered ? "drop-shadow(0 2px 5px rgba(36,87,68,0.45))" : "none",
                    }}
                  />
                )}

                {/* X-axis Day Labels */}
                <text
                  x={p.x}
                  y={paddingTop + plotHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={p.isToday || isHovered ? "600" : "500"}
                  fill={
                    p.isToday
                      ? "var(--color-primary)"
                      : isHovered
                      ? "var(--color-text)"
                      : "var(--color-text-secondary)"
                  }
                  fontFamily="var(--font-sans)"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {currentHover && (
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: `${Math.min(
                Math.max(15, (currentHover.x / svgWidth) * 100),
                80
              )}%`,
              transform: "translateX(-50%)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-control)",
              padding: "10px 14px",
              boxShadow: "0 4px 14px rgba(35, 52, 45, 0.12)",
              pointerEvents: "none",
              zIndex: 10,
              minWidth: "150px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "4px",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--color-text)",
                }}
              >
                {currentHover.fullDate}
              </span>
              {currentHover.isToday && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    backgroundColor: "var(--color-primary)",
                    color: "#FFFFFF",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  TODAY
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
              <span style={{ color: "var(--color-text-secondary)" }}>Consultations:</span>
              <strong className="tabular-nums" style={{ color: "var(--color-text)", marginLeft: "auto" }}>
                {currentHover.visits} pts
              </strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#B38F00" }} />
              <span style={{ color: "var(--color-text-secondary)" }}>Collected:</span>
              <strong className="tabular-nums" style={{ color: "var(--color-text)", marginLeft: "auto" }}>
                {formatCurrency(currentHover.revenue)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--color-border)",
          fontSize: "12px",
          color: "var(--color-text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "12px",
                height: "3px",
                backgroundColor: "var(--color-primary)",
                borderRadius: "2px",
              }}
            />
            <span style={{ fontWeight: "500" }}>Patient Consultations</span>
          </div>

          {(activeMetric === "revenue" || activeMetric === "both") && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "12px",
                  height: "3px",
                  backgroundColor: "#B38F00",
                  borderRadius: "2px",
                }}
              />
              <span style={{ fontWeight: "500" }}>Revenue Realized</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>Hover points for daily breakdown</span>
        </div>
      </div>
    </Card>
  );
}
