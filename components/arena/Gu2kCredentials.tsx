"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ExternalLink, MapPin } from "lucide-react";

/**
 * What GU2K vouches for: Learn badges, work accepted on GU2K, and the states
 * worked in. Read live from GU2K by username, so it is never copied by hand
 * and a paused or withdrawn badge changes here too.
 */
interface Badge {
  code: string;
  level: string;
  name: string;
  status: "active" | "paused";
  issued_at: string;
  verify_url: string;
}
interface Credentials {
  badges: Badge[];
  certified: boolean;
  verified_tasks: number;
  states: string[];
}

const GU2K_API = process.env.NEXT_PUBLIC_GU2K_BASE_URL ?? "https://geturgent2k.co";
const LEARN_URL = "https://gu2k.app/learn";

export default function Gu2kCredentials({ username, isOwner = false }: { username?: string | null; isOwner?: boolean }) {
  const valid = !!username && /^[A-Za-z0-9._-]{2,40}$/.test(username);
  // Keyed by username so a stale answer for another profile is never shown.
  const [result, setResult] = useState<{ for: string; creds: Credentials | null } | null>(null);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    fetch(`${GU2K_API}/api/public/credentials/${encodeURIComponent(username!)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => !cancelled && setResult({ for: username!, creds: j?.data ?? null }))
      .catch(() => !cancelled && setResult({ for: username!, creds: null }));
    return () => {
      cancelled = true;
    };
  }, [username, valid]);

  if (valid && result?.for !== username) return null;
  const creds = valid ? result?.creds ?? null : null;
  const empty = !creds || (creds.badges.length === 0 && creds.verified_tasks === 0);

  if (empty) {
    if (!isOwner) return null;
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-[#D9C2FB] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-black">Get certified on GU2K</p>
          <p className="text-[13px] text-[#747682] mt-0.5">
            Pass GU2K Learn and your badge shows here, with a link anyone can check. Certified earners get certified only gigs at a higher rate.
          </p>
        </div>
        <a
          href={LEARN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center h-10 px-4 rounded-xl bg-[#7E00EE] text-white text-[13px] font-semibold hover:bg-[#6A00C9] transition-colors"
        >
          Start GU2K Learn
        </a>
      </div>
    );
  }

  return (
    <section aria-label="Verified by GU2K" className="mt-4 rounded-2xl border border-[#E9DBFE] bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E00EE]">
          <BadgeCheck className="w-4 h-4" />
          Verified by GU2K
        </p>
        {creds!.verified_tasks > 0 && (
          <p className="text-[13px] text-[#52525B]">
            <span className="font-bold text-black">{creds!.verified_tasks}</span> task{creds!.verified_tasks === 1 ? "" : "s"} accepted
          </p>
        )}
      </div>

      {creds!.badges.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {creds!.badges.map((b) => (
            <li key={b.code} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#F7F2FF] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-black">{b.name}</p>
                <p className="text-[12px] text-[#747682]">
                  {b.status === "active" ? "Active" : "Paused until a refresher is done"} · since{" "}
                  {new Date(b.issued_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} · {b.code}
                </p>
              </div>
              <a
                href={b.verify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#7E00EE] hover:underline"
              >
                Check this badge <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {creds!.states.length > 0 && (
        <p className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-[#747682]">
          <MapPin className="w-3.5 h-3.5" /> Worked in {creds!.states.join(", ")}
        </p>
      )}
    </section>
  );
}
