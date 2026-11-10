"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Proof } from "@/services/proofService";
import { useProofStore } from "@/store/useProofStore";
import { toast } from "sonner";

interface EditProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: Proof | null;
  onUpdated?: (updated: Proof) => void;
}

export default function EditProofModal({
  isOpen,
  onClose,
  proof,
  onUpdated,
}: EditProofModalProps) {
  const { updateProof } = useProofStore();
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && proof) {
      setCaption(proof.caption || "");
    }
  }, [isOpen, proof]);

  if (!isOpen || !proof) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && (!proof.mediaUrls || proof.mediaUrls.length === 0)) {
      toast.error("Please enter a caption for your proof.");
      return;
    }

    setSaving(true);
    try {
      const ok = await updateProof(proof.id, {
        caption: caption.trim(),
      });
      if (ok) {
        toast.success("Proof updated successfully");
        onUpdated?.({ ...proof, caption: caption.trim() });
        onClose();
      } else {
        toast.error("Could not update proof.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[19px] font-bold text-black tracking-[-0.02em]">
              Edit Proof
            </h2>
            <p className="text-[12px] text-[#747682] mt-0.5">
              Proofs can only be edited within 10 minutes of posting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#747682] hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          rows={5}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Update your proof details..."
          className="w-full p-3.5 rounded-2xl border border-[#E4E4EA] text-[13.5px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] resize-none"
        />

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl border border-[#E4E4EA] text-[13px] font-semibold text-black hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 h-10 rounded-xl bg-[#7E00EE] hover:bg-[#6900c7] disabled:bg-[#C78BFF] text-white text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
