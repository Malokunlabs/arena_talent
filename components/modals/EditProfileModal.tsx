"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Search, ImageIcon, Loader2, RefreshCw, Trash2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { UserProfile } from "@/services/userService";
import { mediaService } from "@/services/mediaService";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

const SUGGESTED_NICHES = [
  "Retail Insights",
  "Mystery Shopping",
  "Field Operations",
  "Market Analysis",
  "Brand Activation",
  "UGC Video",
  "Inventory Audit",
  "Customer Experience",
  "Data Collection",
  "Merchandising",
  "Photography",
  "Vox Pop",
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSaved?: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: EditProfileModalProps) {
  const { updateUser } = useUserStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setUsername(user.username || "");
    setLocation(user.location || "");
    setPhone(user.phone || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || null);
    setCoverUrl(user.coverUrl || null);
    setSkills(user.skills || []);
    setSkillQuery("");
  }, [isOpen, user]);

  if (!isOpen) return null;

  const fullName = `${firstName} ${lastName}`.trim() || "Arena Talent";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a PNG or JPEG image.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await mediaService.upload(file, "avatars");
      setAvatarUrl(url);
      toast.success("Profile picture uploaded");
    } catch {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG or JPG image.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Banner image must be under 20MB.");
      return;
    }

    setUploadingCover(true);
    try {
      const url = await mediaService.upload(file, "covers");
      setCoverUrl(url);
      toast.success("Banner image uploaded");
    } catch {
      toast.error("Failed to upload banner image");
    } finally {
      setUploadingCover(false);
    }
  };

  const addSkill = (raw: string) => {
    const clean = raw.trim();
    if (!clean) return;
    if (skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkillQuery("");
      return;
    }
    if (skills.length >= 5) {
      toast.error("You can select up to 5 top skills.");
      return;
    }
    setSkills((prev) => [...prev, clean]);
    setSkillQuery("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const filteredSuggestions = SUGGESTED_NICHES.filter(
    (item) =>
      !skills.some((s) => s.toLowerCase() === item.toLowerCase()) &&
      item.toLowerCase().includes(skillQuery.toLowerCase()),
  ).slice(0, 6);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    setSaving(true);
    try {
      const ok = await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || undefined,
        location: location.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl ?? "",
        coverUrl: coverUrl ?? "",
        skills,
      });

      if (ok) {
        toast.success("Profile updated successfully!");
        onSaved?.();
        onClose();
      } else {
        toast.error("Failed to save profile changes.");
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
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-white rounded-[28px] shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-black tracking-[-0.02em]">
            Edit Profile
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

        {/* Profile Picture Section */}
        <div>
          <p className="text-[13px] font-semibold text-black mb-2.5">
            Profile Picture
          </p>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar name={fullName} src={avatarUrl} size={74} />
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E4EA] hover:bg-gray-50 text-[12px] font-medium text-black transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#747682]" />
                  Replace
                </button>
                <button
                  type="button"
                  disabled={uploadingAvatar || !avatarUrl}
                  onClick={() => setAvatarUrl(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E4EA] hover:bg-gray-50 disabled:opacity-40 text-[12px] font-medium text-black transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#747682]" />
                  Remove
                </button>
              </div>
              <p className="text-[11px] text-[#747682]">
                Upload 400x400 clear PNG or JPEG image
              </p>
            </div>
          </div>
        </div>

        {/* Full Name / Username / Location / Phone / Bio */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-black">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black outline-none focus:border-[#7E00EE]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-black">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black outline-none focus:border-[#7E00EE]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-black">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black outline-none focus:border-[#7E00EE]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-black">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full h-10 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black outline-none focus:border-[#7E00EE]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-black">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black outline-none focus:border-[#7E00EE]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-black">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell brands and collaborators about your work and expertise..."
              className="w-full p-3.5 rounded-xl border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] resize-none"
            />
          </div>
        </div>

        {/* Select your top 5 Skills */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-black">
              Select your top 5 Skills
            </label>
            <span className="text-[11px] text-[#747682]">
              {skills.length}/5 selected
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#747682] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(skillQuery);
                }
              }}
              placeholder="Search and add Niches"
              className="w-full h-10 pl-9 pr-3.5 rounded-full border border-[#E4E4EA] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE]"
            />
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7E00EE] text-[11.5px] font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-black cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {filteredSuggestions.length > 0 && skills.length < 5 && (
            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => addSkill(niche)}
                  className="px-2.5 py-1 rounded-full border border-[#ECECF0] bg-[#FAFAFC] hover:border-[#7E00EE] text-[11px] text-[#747682] hover:text-black transition-colors cursor-pointer"
                >
                  + {niche}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Banner Image Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-black">
              Banner Image
            </label>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                className="text-[11px] font-medium text-red-600 hover:underline cursor-pointer"
              >
                Remove banner
              </button>
            )}
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverFile(file);
              if (coverInputRef.current) coverInputRef.current.value = "";
            }}
            className="hidden"
          />

          <div
            onClick={() => coverInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleCoverFile(file);
            }}
            className="relative rounded-2xl border-2 border-dashed border-[#D4D4DC] hover:border-[#7E00EE] transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden min-h-[125px] bg-[#FAFAFC]"
          >
            {coverUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt="Cover preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-10 bg-black/55 text-white px-3 py-1.5 rounded-full text-[11.5px] font-semibold">
                  Click to replace banner
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#ECECF0] flex items-center justify-center mb-2">
                  {uploadingCover ? (
                    <Loader2 className="w-5 h-5 text-[#7E00EE] animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-[#A1A1AA]" />
                  )}
                </div>
                <p className="text-[12.5px] font-medium text-black">
                  <span className="text-[#2563EB] font-semibold">
                    Click to Upload
                  </span>{" "}
                  or Drag and Drop
                </p>
                <p className="text-[11px] text-[#747682] mt-0.5">
                  PNG or JPG (Max Size: 20MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Save Changes CTA */}
        <button
          type="submit"
          disabled={saving || uploadingAvatar || uploadingCover}
          className="w-full h-11 rounded-xl bg-[#7E00EE] hover:bg-[#6900c7] disabled:bg-[#C78BFF] text-white font-semibold text-[13.5px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
