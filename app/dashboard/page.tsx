"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  talentService,
  TalentOverviewPayload,
  OverviewPeriod,
  OverviewStatCard,
  ProofActivityPoint,
} from "@/services/talentService";
import { useLevelStore } from "@/store/useLevelStore";
import LevelBreakdownModal from "@/components/modals/LevelBreakdownModal";
import {
  LevelEmblem,
  getLevelColor,
  getLevelTrackTint,
  getReadableTextColor,
} from "@/components/arena/LevelBadge";

function PeriodSelect({
  value,
  onChange,
  allTimeLabel = "All time",
}: {
  value: OverviewPeriod;
  onChange: (next: OverviewPeriod) => void;
  allTimeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const currentLabel = value === "this_month" ? "This Month" : allTimeLabel;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 text-[11.5px] font-medium text-[#747682] hover:text-black transition-colors cursor-pointer whitespace-nowrap"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-32 rounded-2xl bg-white border border-[#ECECF0] shadow-[0_12px_30px_rgba(0,0,0,0.08)] py-1 z-30 divide-y divide-[#F1F1F5] animate-in fade-in duration-100">
          <button
            type="button"
            onClick={() => {
              onChange("this_month");
              setOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 text-[12px] transition-colors cursor-pointer ${
              value === "this_month"
                ? "font-semibold text-black"
                : "text-[#747682] hover:text-black"
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("all_time");
              setOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2.5 text-[12px] transition-colors cursor-pointer ${
              value === "all_time"
                ? "font-semibold text-black"
                : "text-[#747682] hover:text-black"
            }`}
          >
            All-time
          </button>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ values }: { values: number[] }) {
  const pts =
    values && values.length >= 2 ? values : [1, 3, 2, 5, 4, 6];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = Math.max(1, max - min);

  const width = 76;
  const height = 28;
  const padY = 4;

  const coords = pts.map((v, idx) => {
    const x = (idx / Math.max(1, pts.length - 1)) * width;
    const y =
      height - padY - ((v - min) / span) * (height - padY * 2);
    return { x, y };
  });

  // Smooth curve via quadratic midpoints
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = coords[coords.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="shrink-0"
    >
      <path
        d={d}
        stroke="#7E00EE"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OverviewStatCardView({
  title,
  card,
  period,
  onPeriodChange,
  allTimeLabel,
}: {
  title: string;
  card: OverviewStatCard;
  period: OverviewPeriod;
  onPeriodChange: (p: OverviewPeriod) => void;
  allTimeLabel?: string;
}) {
  const isPositive =
    card.growthPercent > 0 ||
    /higher|growth/i.test(card.comparisonText || "");

  return (
    <div className="rounded-[20px] border border-[#ECECF0] bg-white p-5 flex flex-col justify-between min-h-[126px]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[28px] font-bold text-black leading-none tracking-[-0.03em]">
          {card.count}
        </span>
        <PeriodSelect
          value={period}
          onChange={onPeriodChange}
          allTimeLabel={allTimeLabel}
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-black truncate">
            {title}
          </p>
          <p
            className={`text-[11.5px] mt-0.5 truncate ${
              isPositive ? "text-[#16A34A] font-medium" : "text-[#747682]"
            }`}
          >
            {card.comparisonText}
          </p>
        </div>
        <MiniSparkline values={card.sparkline} />
      </div>
    </div>
  );
}

function ProofActivityChart({ points }: { points: ProofActivityPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safePoints =
    points && points.length > 0
      ? points
      : [
          { label: "Jan", count: 0 },
          { label: "Feb", count: 0 },
          { label: "Mar", count: 0 },
          { label: "Apr", count: 0 },
          { label: "May", count: 0 },
          { label: "Jun", count: 0 },
        ];

  const rawMax = Math.max(...safePoints.map((p) => p.count), 5);
  const step = rawMax <= 10 ? 2 : rawMax <= 25 ? 5 : rawMax <= 50 ? 10 : 20;
  const yMax = Math.max(step * 5, Math.ceil(rawMax / step) * step);
  const yTicks = [0, 1, 2, 3, 4, 5].map((i) => Math.round((yMax / 5) * i));

  const svgWidth = 540;
  const svgHeight = 230;
  const padLeft = 32;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 26;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const coords = safePoints.map((pt, i) => {
    const x =
      safePoints.length === 1
        ? padLeft + plotW / 2
        : padLeft + (i / (safePoints.length - 1)) * plotW;
    const y = padTop + plotH - (pt.count / yMax) * plotH;
    return { x, y, ...pt };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-[220px] overflow-visible"
      >
        <defs>
          <linearGradient id="proofActivityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7E00EE" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7E00EE" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal dashed gridlines + Y labels */}
        {yTicks.map((tick) => {
          const y = padTop + plotH - (tick / yMax) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#ECECF2"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[#747682] text-[10px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Vertical dashed gridlines + X labels */}
        {coords.map((c, idx) => (
          <g key={`${c.label}-${idx}`}>
            <line
              x1={c.x}
              y1={padTop}
              x2={c.x}
              y2={padTop + plotH}
              stroke="#ECECF2"
              strokeDasharray="3 3"
            />
            <text
              x={c.x}
              y={svgHeight - 4}
              textAnchor="middle"
              className="fill-[#747682] text-[10px]"
            >
              {c.label}
            </text>
          </g>
        ))}

        {/* Area Fill */}
        <path d={areaPath} fill="url(#proofActivityFill)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#7E00EE"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points & Hover Targets */}
        {coords.map((c, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g key={`pt-${idx}`}>
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 4.5 : 3}
                fill={isHovered ? "#7E00EE" : "#FFFFFF"}
                stroke="#7E00EE"
                strokeWidth="2"
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {isHovered && (
                <g transform={`translate(${c.x}, ${Math.max(18, c.y - 14)})`}>
                  <rect
                    x="-36"
                    y="-20"
                    width="72"
                    height="20"
                    rx="6"
                    fill="#18181B"
                  />
                  <text
                    x="0"
                    y="-7"
                    textAnchor="middle"
                    className="fill-white text-[10px] font-semibold"
                  >
                    {c.label}: {c.count}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function OverviewPage() {
  const { fetchMyLevelProgress } = useLevelStore();

  const [salutesPeriod, setSalutesPeriod] =
    useState<OverviewPeriod>("this_month");
  const [proofsPeriod, setProofsPeriod] =
    useState<OverviewPeriod>("this_month");
  const [gigsPeriod, setGigsPeriod] = useState<OverviewPeriod>("all_time");
  const [activityPeriod, setActivityPeriod] =
    useState<OverviewPeriod>("this_month");

  const [overview, setOverview] = useState<TalentOverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const data = await talentService.getMyOverview({
        salutesPeriod,
        proofsPeriod,
        gigsPeriod,
        activityPeriod,
      });
      setOverview(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [salutesPeriod, proofsPeriod, gigsPeriod, activityPeriod]);

  useEffect(() => {
    loadOverview();
    fetchMyLevelProgress();
  }, [loadOverview, fetchMyLevelProgress]);

  if (loading && !overview) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#7E00EE]" />
      </div>
    );
  }

  const salutesCard: OverviewStatCard = overview?.salutesReceived ?? {
    count: 0,
    previousCount: 0,
    growthPercent: 0,
    comparisonText: "Same as last month",
    period: salutesPeriod,
    sparkline: [0, 0, 0, 0, 0, 0],
  };

  const proofsCard: OverviewStatCard = overview?.proofsShared ?? {
    count: 0,
    previousCount: 0,
    growthPercent: 0,
    comparisonText: "Same as last month",
    period: proofsPeriod,
    sparkline: [0, 0, 0, 0, 0, 0],
  };

  const gigsCard: OverviewStatCard = overview?.gigsCompleted ?? {
    count: 0,
    previousCount: 0,
    growthPercent: 0,
    comparisonText: "All-time completed gigs",
    period: gigsPeriod,
    sparkline: [0, 0, 0, 0, 0, 0],
  };

  const progress = overview?.progressIndexBreakdown ?? null;
  const activeColor = getLevelColor(progress?.currentLevel);
  const readableColor = getReadableTextColor(activeColor);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Title */}
      <h1 className="text-[22px] font-bold text-black tracking-[-0.02em]">
        Overview
      </h1>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <OverviewStatCardView
          title="Salutes Received"
          card={salutesCard}
          period={salutesPeriod}
          onPeriodChange={setSalutesPeriod}
        />
        <OverviewStatCardView
          title="Proofs Shared"
          card={proofsCard}
          period={proofsPeriod}
          onPeriodChange={setProofsPeriod}
        />
        <OverviewStatCardView
          title="Gigs Completed"
          card={gigsCard}
          period={gigsPeriod}
          onPeriodChange={setGigsPeriod}
          allTimeLabel="All time"
        />
      </div>

      {/* Bottom 2 Cards: Proof Activity + Progress Index Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Proof Activity Line Chart */}
        <div className="xl:col-span-7 rounded-[22px] border border-[#ECECF0] bg-white p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-black tracking-[-0.01em]">
                Proof Activity
              </h2>
              <p className="text-[12px] text-[#747682] mt-0.5">
                Proofs posted over time
              </p>
            </div>
            <PeriodSelect
              value={activityPeriod}
              onChange={setActivityPeriod}
            />
          </div>

          <ProofActivityChart
            points={overview?.proofActivity?.points ?? []}
          />
        </div>

        {/* Right: Progress Index Breakdown */}
        <div className="xl:col-span-5 rounded-[22px] border border-[#ECECF0] bg-white p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-black tracking-[-0.01em]">
              {progress?.title || "Progress Index Breakdown"}
            </h2>
            <p className="text-[12px] text-[#747682] mt-1 leading-relaxed">
              {progress?.subtitle ||
                "Progress in the Arena by talking about and posting proof of your GU2K Gigs on Arena."}
            </p>
          </div>

          {/* 4 Diamonds Showcase */}
          <button
            type="button"
            onClick={() => progress && setLevelModalOpen(true)}
            className="my-5 w-full rounded-2xl bg-[#FAFAFC] border border-[#F1F1F5] py-7 px-4 flex items-center justify-center gap-4 sm:gap-5 hover:border-[#E4E4EA] transition-colors cursor-pointer"
            title="Click to inspect all Arena rank levels"
          >
            {(progress?.levels || []).map((lvl) => (
              <div
                key={lvl.id}
                className={`transition-transform hover:scale-105 ${
                  lvl.isUnlocked || lvl.isCurrent ? "opacity-100" : "opacity-45"
                }`}
              >
                <LevelEmblem level={lvl} size="md" />
              </div>
            ))}
          </button>

          {/* Current Level & Progress Footer */}
          <div>
            <p className="text-[13px] font-bold">
              <span style={{ color: readableColor }}>
                {progress?.currentLevel?.name || "Hustler"}
              </span>{" "}
              <span className="text-[11.5px] font-normal text-[#747682]">
                Arena Level
              </span>
            </p>
            <p className="text-[11.5px] text-[#747682] mt-0.5">
              {progress?.nextLevel && progress.proofsToNextLevel > 0
                ? `${progress.proofsToNextLevel} ${
                    progress.proofsToNextLevel === 1 ? "Proof" : "Proofs"
                  } to reach ${progress.nextLevel.name}`
                : "Top Arena level reached"}
            </p>

            {/* Colored Progress Bar */}
            <div
              style={{
                backgroundColor: getLevelTrackTint(activeColor),
              }}
              className="mt-2.5 h-2 w-full rounded-full overflow-hidden"
            >
              <div
                style={{
                  width: `${progress?.progressPercent ?? 0}%`,
                  backgroundColor: activeColor,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10.5px] font-semibold text-[#747682] uppercase tracking-wider">
              <span>{progress?.indexLabel || "HUSTLER INDEX"}</span>
              <span>{progress?.progressPercent ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <LevelBreakdownModal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        progress={progress}
      />
    </div>
  );
}
