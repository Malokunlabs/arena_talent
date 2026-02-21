"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/useUserStore";
import { UserProfile } from "@/services/userService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, fetchUser, isLoading } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading && !user) {
    return <SettingsSkeleton />;
  }

  // Use a key to force re-mounting of the form when user data changes (e.g. initial load)
  // This avoids the need for useEffect to sync state
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* 
        We use the user ID as a key. When user loads/changes, the form will remount 
        and initialize `useState` with the new data. 
        If user is null, we render the form with empty strings (or could show loading).
      */}
      <SettingsForm key={user?.id || "loading"} user={user} />
    </div>
  );
}

function SettingsForm({ user }: { user: UserProfile | null }) {
  const { updateUser, isLoading } = useUserStore();

  // Initialize state directly from props.
  // Because of the key on the parent, this runs again when user changes.
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    let key = id;
    if (id === "username") key = "fullName";

    // Handle password fields mapping if needed, or just use IDs directly
    if (id === "current-password") key = "currentPassword";
    if (id === "new-password") key = "newPassword";
    if (id === "confirm-password") key = "confirmPassword";

    setFormData((prev) => ({ ...prev, [key]: value }));
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

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
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
          disabled={isLoading}
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
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
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
