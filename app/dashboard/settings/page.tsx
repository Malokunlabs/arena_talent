"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash2, Save, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

// Custom Toggle Switch component
const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-[#7300E5]" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
};

const ALL_SKILLS = [
  "DCAS", "Field Ops", "Mystery Shop", "UGC Video", "Vox Pop",
  "Transcription", "FGD Moderation", "Photography", "Video Editing",
  "Social Media", "Copywriting", "Content Strategy"
];

export default function SettingsPage() {
  const { user, fetchUser, isLoading, updateUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    location: "",
    phone: "",
    email: "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);
  const [isAddingCustomSkill, setIsAddingCustomSkill] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [addedCustomSkills, setAddedCustomSkills] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        email: user.email || "",
      });
      if (user.skills) {
        setActiveSkills(user.skills);
      }
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    const success = await updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      location: formData.location,
      phone: formData.phone,
    });
    setIsUpdatingProfile(false);
    
    if (success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const [toggles, setToggles] = useState({
    newHire: true,
    collabProposals: true,
    dailyPulse: false,
    proofSalutes: true,
    weeklyDigest: false,
    marketing: false,
    availability: true,
    publicProfile: true,
    twoFactor: false,
  });

  const allAvailableSkills = Array.from(new Set([...ALL_SKILLS, ...(user?.skills || []), ...addedCustomSkills]));
  const inactiveSkills = allAvailableSkills.filter(skill => !activeSkills.includes(skill));

  const toggleSkill = (skill: string) => {
    if (activeSkills.includes(skill)) {
      setActiveSkills(prev => prev.filter(s => s !== skill));
    } else {
      if (activeSkills.length >= 5) {
        toast.error("You can only select up to 5 skills");
        return;
      }
      setActiveSkills(prev => [...prev, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const skill = customSkillInput.trim();
    if (!skill) return;
    
    if (activeSkills.includes(skill) || allAvailableSkills.includes(skill)) {
      toast.error("Skill already exists");
      return;
    }
    
    if (activeSkills.length >= 5) {
      toast.error("You can only select up to 5 skills");
      return;
    }
    
    setAddedCustomSkills(prev => [...prev, skill]);
    setActiveSkills(prev => [...prev, skill]);
    setCustomSkillInput("");
    setIsAddingCustomSkill(false);
  };

  const handleUpdateSkills = async () => {
    setIsUpdatingSkills(true);
    const success = await updateUser({ skills: activeSkills });
    setIsUpdatingSkills(false);
    
    if (success) {
      toast.success("Skills updated successfully");
    } else {
      toast.error("Failed to update skills");
    }
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account, profile, and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-500">
            Update your public profile details visible to brands and collaborators
          </p>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#7300E5] flex-shrink-0 relative border border-gray-200 flex items-center justify-center">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white font-bold text-3xl tracking-widest uppercase">
                {`${formData.firstName.charAt(0) || "U"}${formData.lastName.charAt(0) || ""}`}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" /> Change Photo
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Surname <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <Label className="text-sm font-semibold text-gray-700">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.username}
            disabled
            className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2 mb-2">
          <Label className="text-sm font-semibold text-gray-700">Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="min-h-[120px] resize-none rounded-xl border-gray-200 py-3"
          />
        </div>
        <p className="text-xs text-gray-400 mb-8 font-medium">
          {formData.bio.length}/220 characters
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Number</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Email</Label>
          <Input
            value={formData.email}
            disabled
            className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
            className="flex items-center gap-2 bg-[#7300E5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#6000c0] transition-colors shadow-sm disabled:opacity-70"
          >
            {isUpdatingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Profile
          </button>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Top Skills</h2>
          <p className="text-sm text-gray-500">
            Select up to 5 skills that best represent your expertise
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {activeSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className="px-4 py-2 rounded-full border border-purple-400 bg-[#F4ECFF] text-[#7300E5] text-sm font-bold transition-colors hover:bg-purple-100"
            >
              {skill}
            </button>
          ))}
          {inactiveSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-sm font-semibold transition-colors hover:bg-gray-50 hover:border-gray-300"
            >
              {skill}
            </button>
          ))}
          {isAddingCustomSkill ? (
            <div className="flex items-center gap-2">
              <Input 
                autoFocus 
                value={customSkillInput} 
                onChange={e => setCustomSkillInput(e.target.value)} 
                className="h-9 w-32 rounded-full text-sm border-gray-300 px-3"
                placeholder="Type skill..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomSkill();
                  if (e.key === 'Escape') setIsAddingCustomSkill(false);
                }}
              />
              <button onClick={handleAddCustomSkill} className="text-sm font-bold text-[#7300E5] px-2 hover:underline">Add</button>
              <button onClick={() => setIsAddingCustomSkill(false)} className="text-sm text-gray-400 px-2 hover:text-gray-600">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCustomSkill(true)}
              className="px-4 py-2 rounded-full border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm font-semibold transition-colors hover:bg-gray-100 hover:border-gray-400 flex items-center gap-1"
            >
              Others +
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-8 font-medium">
          {activeSkills.length}/5 skills selected
        </p>

        <div className="flex justify-end">
          <button 
            onClick={handleUpdateSkills}
            disabled={isUpdatingSkills}
            className="flex items-center gap-2 bg-[#7300E5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#6000c0] transition-colors shadow-sm disabled:opacity-70"
          >
            {isUpdatingSkills ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Skills
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Choose what you want to be notified about</p>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">New Hire Requests</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Get notified when a brand wants to hire you
              </p>
            </div>
            <ToggleSwitch checked={toggles.newHire} onChange={() => handleToggle("newHire")} />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Collaboration Proposals</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Get notified when someone wants to collaborate
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.collabProposals}
              onChange={() => handleToggle("collabProposals")}
            />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Daily Pulse Reminders</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Remind me to complete daily pulse questions
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.dailyPulse}
              onChange={() => handleToggle("dailyPulse")}
            />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Proof Salutes</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Get notified when someone salutes your proof
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.proofSalutes}
              onChange={() => handleToggle("proofSalutes")}
            />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Weekly Digest</h3>
              <p className="text-xs text-gray-500 mt-0.5">Receive a weekly summary of your activity</p>
            </div>
            <ToggleSwitch
              checked={toggles.weeklyDigest}
              onChange={() => handleToggle("weeklyDigest")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Marketing & Promotions</h3>
              <p className="text-xs text-gray-500 mt-0.5">Updates about new features and opportunities</p>
            </div>
            <ToggleSwitch
              checked={toggles.marketing}
              onChange={() => handleToggle("marketing")}
            />
          </div>
        </div>
      </div>

      {/* Account & Security */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900">Account & Security</h2>
          <p className="text-sm text-gray-500">Manage your account security and preferences</p>
        </div>

        <div className="space-y-5 mb-8">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Availability Status</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage your account security and preferences</p>
            </div>
            <ToggleSwitch
              checked={toggles.availability}
              onChange={() => handleToggle("availability")}
            />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Public Profile</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Allow anyone to view your profile and proofs
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.publicProfile}
              onChange={() => handleToggle("publicProfile")}
            />
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Two-Factor Authentication</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Add an extra layer of security to your account
              </p>
            </div>
            <ToggleSwitch
              checked={toggles.twoFactor}
              onChange={() => handleToggle("twoFactor")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              className="h-12 rounded-xl border-gray-200"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-[#7300E5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#6000c0] transition-colors shadow-sm">
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
          <p className="text-sm text-gray-500">
            Irreversible actions that affect your account
          </p>
        </div>

        <div className="border border-red-500 rounded-xl p-6 bg-red-50/10">
          <h3 className="font-bold text-red-500 text-sm mb-1">Delete Account</h3>
          <p className="text-xs text-gray-500 mb-5 font-medium">
            Permanently delete your account, all proofs, and data. This cannot be undone.
          </p>
          <button className="flex items-center gap-2 border border-red-500 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
