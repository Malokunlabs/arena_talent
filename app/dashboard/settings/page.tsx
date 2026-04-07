"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/useUserStore";
import { UserProfile } from "@/services/userService";
import { mediaService } from "@/services/mediaService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, fetchUser, isLoading } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading && !user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <SettingsForm key={user?.id || "loading"} user={user} />
    </div>
  );
}

function SettingsForm({ user }: { user: UserProfile | null }) {
  const { updateUser, isLoading } = useUserStore();

  const [formData, setFormData] = useState({
    fullName: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (user as UserProfile & { avatarUrl?: string })?.avatarUrl || null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    let key = id;
    if (id === "username") key = "fullName";
    if (id === "current-password") key = "currentPassword";
    if (id === "new-password") key = "newPassword";
    if (id === "confirm-password") key = "confirmPassword";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setAvatarPreview(URL.createObjectURL(file));

    try {
      setIsUploadingAvatar(true);

      // Steps 1 & 2: Upload to R2
      const avatarUrl = await mediaService.upload(file, "avatars");

      // Step 3: Link avatar URL to profile
      await updateUser({ avatarUrl });

      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload avatar. Please try again.");
      setAvatarPreview(
        (user as UserProfile & { avatarUrl?: string })?.avatarUrl || null,
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }

    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    const success = await updateUser({
      firstName,
      lastName,
      bio: formData.bio,
      phone: formData.phone,
    });

    if (success) {
      toast.success("Profile updated successfully");
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = formData.fullName || user?.email || "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {getInitials()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#7300E5] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#5f00bd] transition-colors disabled:opacity-60"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isUploadingAvatar}
          />
        </div>
        <p className="text-sm text-gray-500">
          {isUploadingAvatar ? "Uploading..." : "Click to change photo"}
        </p>
      </div>

      {/* Profile Info */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
          Profile Information
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
          Security
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading || isUploadingAvatar}
          className="bg-[#7300E5] hover:bg-[#5f00bd] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-purple-100"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        {/* Avatar Skeleton */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
