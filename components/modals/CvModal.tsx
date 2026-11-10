"use client";

import React, { useRef, useState } from "react";
import { X, Loader2, FileText } from "lucide-react";
import { Talent } from "@/services/talentService";
import { UserProfile } from "@/services/userService";
import { mediaService } from "@/services/mediaService";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
  talent?: Talent | UserProfile | null;
  canEdit?: boolean;
  onUpdated?: () => void;
}

export default function CvModal({
  isOpen,
  onClose,
  talent,
  canEdit = true,
  onUpdated,
}: CvModalProps) {
  const { updateUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !talent) return null;

  const fullName = `${talent.firstName || ""} ${talent.lastName || ""}`.trim() || "Arena Talent";
  const cvUrl = talent.cvUrl || null;
  const isPdf = Boolean(cvUrl && /\.pdf($|\?)/i.test(cvUrl));
  const isImage = Boolean(
    cvUrl && /\.(png|jpe?g|webp|gif)($|\?)/i.test(cvUrl),
  );

  const handleUploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await mediaService.upload(file, "cvs");
      const ok = await updateUser({ cvUrl: publicUrl });
      if (ok) {
        toast.success("CV updated successfully!");
        onUpdated?.();
      } else {
        toast.error("Failed to save CV URL.");
      }
    } catch {
      toast.error("Failed to upload CV file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadCv = () => {
    if (cvUrl) {
      const a = document.createElement("a");
      a.href = cvUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `${fullName.replace(/\s+/g, "_")}_CV`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate downloadable text/HTML summary when no file is uploaded yet
    const skillsLine =
      talent.skills && talent.skills.length > 0
        ? talent.skills.join(", ")
        : "Field Operations, Retail Audits";
    const summaryText = [
      fullName,
      talent.location || "Nigeria",
      talent.email || "",
      "",
      "SUMMARY",
      talent.bio || "Arena Talent sharing verified proofs of completed GU2K gigs.",
      "",
      "TOP SKILLS",
      skillsLine,
      "",
      `Completed Gigs: ${talent.totalGigs ?? 0}`,
    ].join("\n");

    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fullName.replace(/\s+/g, "_")}_Arena_CV.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CV downloaded!");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Your CV
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pink/Purple Frame Wrapping the White Document Preview */}
        <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-[#F0ABFC] via-[#E879F9] to-[#C084FC]">
          {/* Decorative background curves */}
          <svg
            viewBox="0 0 400 320"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
            preserveAspectRatio="none"
          >
            <circle cx="340" cy="30" r="95" fill="#F5D0FE" />
            <path
              d="M-30 250 C40 150, 140 160, 210 230 C270 290, 340 280, 420 220 L420 340 L-30 340 Z"
              fill="#D946EF"
            />
          </svg>

          {/* Inner White CV Card */}
          <div className="relative z-10 bg-white rounded-xl shadow-lg p-5 sm:p-6 min-h-[290px] max-h-[340px] overflow-y-auto text-left">
            {isImage && cvUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cvUrl}
                alt={`${fullName} CV`}
                className="w-full h-auto rounded-lg object-contain"
              />
            ) : isPdf && cvUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1F1F5] pb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-black">
                      {fullName}
                    </h3>
                    <p className="text-[11px] text-[#747682]">
                      Uploaded PDF Curriculum Vitae
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7E00EE] text-[10.5px] font-semibold">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                </div>
                <iframe
                  src={cvUrl}
                  title={`${fullName} CV`}
                  className="w-full h-[215px] rounded-lg border border-[#ECECF0]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-bold text-black">
                    {fullName}
                  </h3>
                  <p className="text-[11.5px] text-[#747682] mt-0.5">
                    {talent.skills?.[0] || "Field Agent"} &bull;{" "}
                    {talent.location || "Nigeria"}
                  </p>
                </div>

                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#747682] mb-1">
                    Summary
                  </p>
                  <p className="text-[11.5px] leading-relaxed text-[#52525B]">
                    {talent.bio ||
                      "Verified Arena talent executing field audits, retail evaluations, and brand activations across GU2K gigs."}
                  </p>
                </div>

                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#747682] mb-1">
                    Track Record
                  </p>
                  <p className="text-[11.5px] font-semibold text-black">
                    {talent.totalGigs ?? 0} Completed GU2K Gigs
                  </p>
                  <p className="text-[11px] text-[#747682] mt-0.5">
                    Verified proof-of-work portfolio hosted on Arena.
                  </p>
                </div>

                {talent.skills && talent.skills.length > 0 && (
                  <div>
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#747682] mb-1.5">
                      Skills &amp; Niches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {talent.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full bg-[#F5F5F8] text-black text-[10.5px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {cvUrl && (
                  <p className="text-[11px] text-[#7E00EE] font-medium pt-1">
                    Attached document ready for download.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleUploadCv}
          className="hidden"
        />

        <div
          className={`mt-5 grid gap-3 ${
            canEdit ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {canEdit && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl border border-[#E4E4EA] bg-white hover:bg-gray-50 text-[13px] font-semibold text-black transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Uploading..." : "Edit CV"}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadCv}
            className="h-11 rounded-xl bg-[#7E00EE] hover:bg-[#6900c7] text-white text-[13px] font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Download CV
          </button>
        </div>
      </div>
    </div>
  );
}
