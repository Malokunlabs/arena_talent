"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, X, Loader2, Play, CheckCircle2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useUserStore } from "@/store/useUserStore";
import { useProofStore } from "@/store/useProofStore";
import { mediaService } from "@/services/mediaService";
import { ProofMediaItem } from "@/services/proofService";
import { Gig } from "@/services/gigService";
import SelectGigModal from "@/components/modals/SelectGigModal";
import { toast } from "sonner";

interface UploadedAttachment {
  id: string;
  previewUrl: string;
  uploadedUrl?: string;
  type: "image" | "video";
  duration?: number;
  uploading: boolean;
  progress: number;
}

function getVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      const sec = Math.round(video.duration);
      resolve(Number.isFinite(sec) && sec > 0 ? sec : undefined);
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(undefined);
    };
    video.src = objectUrl;
  });
}

function formatDuration(seconds?: number): string {
  const sec = seconds && seconds > 0 ? Math.round(seconds) : 49;
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

function CircularProgress({ percent }: { percent: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-150"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-white">
        {clamped}%
      </span>
    </div>
  );
}

function showProofPostedToast() {
  toast.custom(
    (t) => (
      <div className="flex items-center justify-between gap-4 bg-[#1EB954] text-white px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(30,185,84,0.28)] min-w-[300px] sm:min-w-[350px]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-white fill-white/20 shrink-0" />
          <span className="text-[13.5px] font-medium">
            Proof successfully posted
          </span>
        </div>
        <button
          type="button"
          onClick={() => toast.dismiss(t)}
          className="p-0.5 rounded-md hover:bg-white/15 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    ),
    {
      position: "top-center",
      duration: 4000,
    },
  );
}

export default function InlineProofComposer({
  composerRef,
}: {
  composerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const { user } = useUserStore();
  const { createProof } = useProofStore();

  const [caption, setCaption] = useState("");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isGigModalOpen, setIsGigModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Arena Talent"
    : "Arena Talent";

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const previewUrl = URL.createObjectURL(file);
      const duration = isVideo ? await getVideoDuration(file) : undefined;

      setAttachments((prev) => [
        ...prev,
        {
          id: tempId,
          previewUrl,
          type: isVideo ? "video" : "image",
          duration,
          uploading: true,
          progress: 5,
        },
      ]);

      try {
        const publicUrl = await mediaService.uploadWithProgress(
          file,
          "proofs",
          (percent) => {
            setAttachments((prev) =>
              prev.map((item) =>
                item.id === tempId ? { ...item, progress: percent } : item,
              ),
            );
          },
        );
        setAttachments((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? {
                  ...item,
                  uploadedUrl: publicUrl,
                  uploading: false,
                  progress: 100,
                }
              : item,
          ),
        );
      } catch {
        toast.error(`Failed to upload ${file.name}`);
        setAttachments((prev) => prev.filter((item) => item.id !== tempId));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const isUploadingAny = attachments.some((a) => a.uploading);
  const readyMediaItems: ProofMediaItem[] = attachments
    .filter((a) => Boolean(a.uploadedUrl))
    .map((a) => ({
      url: a.uploadedUrl!,
      type: a.type,
      ...(a.duration ? { duration: a.duration } : {}),
    }));

  const canSubmit =
    !isSubmitting &&
    !isUploadingAny &&
    (caption.trim().length > 0 || readyMediaItems.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const isRealBackendGig =
        selectedGig && !selectedGig.id.startsWith("fallback-");

      const ok = await createProof({
        caption: caption.trim() || undefined,
        mediaUrls: readyMediaItems.map((m) => m.url),
        mediaItems: readyMediaItems,
        gigId: isRealBackendGig ? selectedGig.id : undefined,
        title: selectedGig?.title || undefined,
        category: selectedGig?.category || selectedGig?.title || undefined,
      });

      if (ok) {
        setCaption("");
        setAttachments([]);
        setSelectedGig(null);
        showProofPostedToast();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Top purple loading bar when posting proof */}
      {isSubmitting && (
        <div className="fixed top-11 left-0 right-0 z-50 h-[3px] bg-[#EFEFF3] overflow-hidden">
          <div className="h-full w-1/3 bg-[#7E00EE] rounded-r-full animate-[loading-bar_1.1s_ease-in-out_infinite]" />
          <style jsx>{`
            @keyframes loading-bar {
              0% {
                transform: translateX(-100%);
                width: 35%;
              }
              50% {
                width: 55%;
              }
              100% {
                transform: translateX(350%);
                width: 35%;
              }
            }
          `}</style>
        </div>
      )}

      <div
        ref={composerRef}
        className="bg-white border border-[#ECECF0] rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
      >
        {/* Top Row: User Avatar + Select/Selected Gig Pill */}
        <div className="flex items-center gap-3">
          <div className="rounded-full p-[2px] bg-gradient-to-tr from-[#F59E0B] to-[#7E00EE] shrink-0">
            <UserAvatar
              name={fullName}
              src={user?.avatarUrl}
              size={38}
              className="border-2 border-white"
            />
          </div>

          {selectedGig ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E4E4EA] bg-white text-[13px] font-medium text-black max-w-[320px]">
              <button
                type="button"
                onClick={() => setIsGigModalOpen(true)}
                className="inline-flex items-center gap-2 min-w-0 cursor-pointer"
              >
                <Image
                  src="/icons/briefcase.svg"
                  alt="Gig"
                  width={16}
                  height={16}
                  className="shrink-0"
                />
                <span className="truncate">{selectedGig.title}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGig(null)}
                className="p-0.5 rounded-full text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                title="Clear selected gig"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsGigModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E4E4EA] bg-white hover:bg-gray-50 transition-colors text-[13px] font-medium text-[#747682] max-w-[300px] cursor-pointer"
            >
              <Image
                src="/icons/briefcase.svg"
                alt="Gig"
                width={16}
                height={16}
                className="shrink-0"
              />
              <span className="truncate">Select a Gig to talk about</span>
              <ChevronDown className="w-4 h-4 text-[#747682] shrink-0" />
            </button>
          )}
        </div>

        {/* Textarea (optional when media is attached; required if no media) */}
        <div className="mt-4">
          <textarea
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isSubmitting}
            placeholder="Write here to talk about how this Gig went"
            className="w-full resize-none border-0 outline-none text-[14px] leading-relaxed text-black placeholder:text-[#747682] bg-transparent disabled:opacity-70"
          />
        </div>

        {/* Multi-Media Preview Grid (4-column cards with circular upload % & remove X) */}
        {attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-[#E6E6EC] bg-gray-100"
              >
                {att.type === "video" ? (
                  <video
                    src={att.previewUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.previewUrl}
                    alt="Attachment"
                    className="w-full h-full object-cover"
                  />
                )}

                {att.type === "video" && (
                  <div className="pointer-events-none absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{formatDuration(att.duration)}</span>
                  </div>
                )}

                {att.uploading ? (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <CircularProgress percent={att.progress} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-black shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action Row */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full border border-[#E4E4EA] flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Add images or videos"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={!canSubmit && !isSubmitting}
            onClick={handleSubmit}
            className={`min-w-[112px] px-5 h-9 rounded-full text-[13px] font-semibold text-white transition-all flex items-center justify-center ${
              isSubmitting
                ? "bg-[#7E00EE] cursor-wait"
                : canSubmit
                  ? "bg-[#7E00EE] hover:bg-[#6900c7] cursor-pointer shadow-sm"
                  : "bg-[#C78BFF] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              "Share Proof"
            )}
          </button>
        </div>
      </div>

      <SelectGigModal
        isOpen={isGigModalOpen}
        onClose={() => setIsGigModalOpen(false)}
        selectedGigId={selectedGig?.id}
        onSelectGig={(gig) => setSelectedGig(gig)}
      />
    </>
  );
}
