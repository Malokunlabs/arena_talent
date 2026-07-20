"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Code, PenTool, Camera, Save, Plus, Trash2, GripVertical, Image as ImageIcon, Upload } from "lucide-react";
import adminBadgeService, { CreateBadgeDto } from "@/services/adminBadgeService";

const PRESET_ICONS = [
  { key: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { key: "Code", icon: Code, label: "Code" },
  { key: "PenTool", icon: PenTool, label: "Pen Tool" },
  { key: "Camera", icon: Camera, label: "Camera" },
];

type FieldType = "short_text" | "long_text" | "file_upload" | "select";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  validation?: {
    maxSizeMb?: number;
    maxWords?: number;
    options?: string[];
  };
}

export default function CreateBadgePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    iconKey: string;
    scopeOfWork: string;
    assessmentMethod: string;
    isActive: boolean;
  }>({
    name: "",
    iconKey: "Sparkles",
    scopeOfWork: "",
    assessmentMethod: "Peer Review",
    isActive: true,
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    try {
      setUploadingIcon(true);
      setError("");
      const res = await adminBadgeService.uploadBadgeIcon(file);
      setFormData(prev => ({ ...prev, iconKey: res.url }));
    } catch (err: any) {
      setError("Failed to upload icon: " + err.message);
    } finally {
      setUploadingIcon(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addField = () => {
    setFormFields([
      ...formFields,
      {
        id: `field_${Date.now()}`,
        label: "New Field",
        type: "short_text",
        required: true,
        validation: { maxWords: 100 },
      },
    ]);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleFieldValidationChange = (id: string, key: string, value: any) => {
    setFormFields(formFields.map(f => {
      if (f.id === id) {
        return {
          ...f,
          validation: {
            ...f.validation,
            [key]: value,
          },
        };
      }
      return f;
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.scopeOfWork || !formData.assessmentMethod) {
        setError("Please fill in all required fields (Name, Scope of Work, Assessment Method).");
        return;
      }
      
      const missingLabels = formFields.some(f => !f.label.trim());
      if (missingLabels) {
        setError("All form fields must have a label.");
        return;
      }

      setLoading(true);
      setError("");
      
      const payload: CreateBadgeDto = {
        ...formData,
        formSchema: formFields,
      };

      await adminBadgeService.createBadgeDefinition(payload);
      router.push("/admin/badges");
    } catch (err: any) {
      setError(err.message || "Failed to create badge");
    } finally {
      setLoading(false);
    }
  };

  const isCustomIcon = formData.iconKey.startsWith("http");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[#7300E5] hover:border-[#7300E5] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Badge</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Define a new skill badge and build its application form.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Core Info */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                1. Core Information
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-gray-700">Badge Status:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7300E5]"></div>
                  <span className="ml-2 text-[13px] font-medium text-gray-600">
                    {formData.isActive ? "Active" : "Paused"}
                  </span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Badge Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Video Editor"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Assessment Method *</label>
                <select
                  name="assessmentMethod"
                  value={formData.assessmentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all"
                >
                  <option value="Peer Review">Peer Review</option>
                  <option value="Portfolio Review">Portfolio Review</option>
                  <option value="Automated Test">Automated Test</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[13px] font-semibold text-gray-700">Scope of Work *</label>
                <textarea
                  name="scopeOfWork"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                  placeholder="Describe the skills and responsibilities covered by this badge..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all resize-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-semibold text-gray-700">Badge Icon *</label>
                <div className="flex flex-wrap gap-3 items-center">
                  {PRESET_ICONS.map((iconOpt) => {
                    const IconComp = iconOpt.icon;
                    const isSelected = formData.iconKey === iconOpt.key;
                    return (
                      <button
                        key={iconOpt.key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconKey: iconOpt.key }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-[#7300E5]/10 border-[#7300E5] text-[#7300E5]' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        {iconOpt.label}
                      </button>
                    )
                  })}
                  
                  <div className="h-8 w-px bg-gray-200 mx-1"></div>

                  {/* Custom Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleIconUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingIcon}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isCustomIcon
                        ? 'bg-[#7300E5]/10 border-[#7300E5] text-[#7300E5]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {uploadingIcon ? (
                      <div className="w-4 h-4 border-2 border-[#7300E5] border-t-transparent rounded-full animate-spin" />
                    ) : isCustomIcon ? (
                      <img src={formData.iconKey} alt="Custom" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isCustomIcon ? "Custom Icon" : "Upload Custom"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Form Builder */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-2 mb-4 gap-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  2. Dynamic Form Builder
                </h2>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Design the exact form applicants will fill out to apply for this badge.
                </p>
              </div>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7300E5]/10 text-[#7300E5] rounded-lg text-sm font-bold hover:bg-[#7300E5]/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
            
            <div className="space-y-4">
              {formFields.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">No form fields yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Field" to start building your application form.</p>
                </div>
              ) : (
                formFields.map((field, index) => (
                  <div key={field.id} className="relative group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-[#7300E5]/40 transition-colors">
                    
                    {/* Delete button (absolute) */}
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="mt-2 text-gray-300 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Field Label */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Field Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="e.g. Portfolio URL"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7300E5]"
                          />
                        </div>

                        {/* Field Type */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Field Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const type = e.target.value as FieldType;
                              let validation = { ...field.validation };
                              if (type === "file_upload" && !validation.maxSizeMb) validation.maxSizeMb = 5;
                              if (type === "long_text" && !validation.maxWords) validation.maxWords = 200;
                              if (type === "short_text" && !validation.maxWords) validation.maxWords = 100;
                              updateField(field.id, { type, validation });
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7300E5]"
                          >
                            <option value="short_text">Short Text</option>
                            <option value="long_text">Long Text (Textarea)</option>
                            <option value="file_upload">File Upload</option>
                          </select>
                        </div>

                        {/* Description (Optional) */}
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Helper Text / Description (Optional)</label>
                          <input
                            type="text"
                            value={field.description || ""}
                            onChange={(e) => updateField(field.id, { description: e.target.value })}
                            placeholder="Instructions for the applicant..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7300E5]"
                          />
                        </div>

                        {/* Validation & Settings */}
                        <div className="flex items-center gap-4 mt-2 md:col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="rounded text-[#7300E5] focus:ring-[#7300E5]"
                            />
                            <span className="text-sm font-semibold text-gray-700">Required Field</span>
                          </label>

                          <div className="h-4 w-px bg-gray-200"></div>

                          {field.type === "file_upload" && (
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold text-gray-600">Max File Size (MB):</span>
                              <input
                                type="number"
                                min="1"
                                value={field.validation?.maxSizeMb || 5}
                                onChange={(e) => handleFieldValidationChange(field.id, "maxSizeMb", parseInt(e.target.value) || 5)}
                                className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm text-center"
                              />
                            </div>
                          )}

                          {(field.type === "short_text" || field.type === "long_text") && (
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold text-gray-600">Max Words:</span>
                              <input
                                type="number"
                                min="1"
                                value={field.validation?.maxWords || (field.type === "long_text" ? 200 : 100)}
                                onChange={(e) => handleFieldValidationChange(field.id, "maxWords", parseInt(e.target.value) || 100)}
                                className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm text-center"
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-[#7300E5] hover:bg-[#5c00b8] transition-all disabled:opacity-50 shadow-sm shadow-[#7300E5]/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Badge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
