"use client";

import React, { useRef, useState } from "react";
import { Upload, X, CheckCircle2, Loader2, FileText } from "lucide-react";
import { type FormField } from "@/services/badgeService";
import { mediaService } from "@/services/mediaService";

interface FormRendererProps {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (
    fieldId: string,
    value: unknown | ((prev: unknown) => unknown),
  ) => void;
  badgeName: string;
}

interface UploadedFile {
  file: File;
  progress: number;
  done: boolean;
  url?: string;
}

export default function FormRenderer({
  fields,
  values,
  onChange,
  badgeName,
}: FormRendererProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [dragOver, setDragOver] = useState<Record<string, boolean>>({});

  const handleFileAdd = (fieldId: string, newFiles: FileList | File[]) => {
    const added: UploadedFile[] = Array.from(newFiles).map((f) => ({
      file: f,
      progress: 0,
      done: false,
    }));

    onChange(fieldId, (prevValue: unknown) => {
      const existing = (prevValue as UploadedFile[]) ?? [];
      return [...existing, ...added];
    });

    // Actual upload
    added.forEach(async (item) => {
      try {
        const url = await mediaService.upload(item.file, "badge-applications");

        onChange(fieldId, (prevValue: unknown) => {
          const current = (prevValue as UploadedFile[]) ?? [];
          const idx = current.findIndex((c) => c.file === item.file);
          if (idx !== -1) {
            const next = [...current];
            next[idx] = { ...next[idx], progress: 100, done: true, url };
            return next;
          }
          return current;
        });
      } catch (error) {
        console.error("Upload failed for", item.file.name, error);
      }
    });
  };

  const handleFileRemove = (fieldId: string, index: number) => {
    onChange(fieldId, (prevValue: unknown) => {
      const existing = (prevValue as UploadedFile[]) ?? [];
      return existing.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h3 className="font-bold text-gray-900 text-lg">
          {badgeName} Assessment
        </h3>
        <p className="text-[13px] text-gray-500">
          Upload your portfolio and complete the sample brief
        </p>
      </div>

      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-[14px] font-semibold text-gray-800">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* File Upload */}
          {field.type === "file_upload" && (
            <div className="space-y-3">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver[field.id]
                    ? "border-[#7300E5] bg-[#F4ECFF]"
                    : "border-gray-200 hover:border-[#7300E5]/40 hover:bg-gray-50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver((d) => ({ ...d, [field.id]: true }));
                }}
                onDragLeave={() =>
                  setDragOver((d) => ({ ...d, [field.id]: false }))
                }
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver((d) => ({ ...d, [field.id]: false }));
                  handleFileAdd(field.id, e.dataTransfer.files);
                }}
                onClick={() => fileInputRefs.current[field.id]?.click()}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">
                  Drag & drop your portfolio images
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  or click to browse ·{" "}
                  {field.validation?.accept
                    ?.map((a) =>
                      a
                        .replace("image/", "")
                        .replace("video/", "")
                        .toUpperCase(),
                    )
                    .join(", ") ?? "All files"}{" "}
                  · Max {field.validation?.maxSizeMb ?? 5}MB each
                </p>
                <input
                  ref={(el) => {
                    fileInputRefs.current[field.id] = el;
                  }}
                  type="file"
                  multiple
                  className="hidden"
                  accept={field.validation?.accept?.join(",")}
                  onChange={(e) => {
                    if (e.target.files) handleFileAdd(field.id, e.target.files);
                  }}
                />
              </div>

              {/* File list */}
              {((values[field.id] as UploadedFile[]) ?? []).length > 0 && (
                <div className="space-y-2">
                  {((values[field.id] as UploadedFile[]) ?? []).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5"
                      >
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-700 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {(item.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                          <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-[#7300E5] rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-[#7300E5] animate-spin" />
                          )}
                          <button
                            onClick={() => handleFileRemove(field.id, idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                  {field.validation?.minFiles && (
                    <p className="text-[12px] text-gray-400">
                      {((values[field.id] as UploadedFile[]) ?? []).length} of{" "}
                      {field.validation.minFiles} minimum files uploaded.{" "}
                      {Math.max(
                        0,
                        field.validation.minFiles -
                          ((values[field.id] as UploadedFile[]) ?? []).length,
                      ) > 0 &&
                        `${Math.max(0, field.validation.minFiles - ((values[field.id] as UploadedFile[]) ?? []).length)} more required.`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Textarea (long_text) */}
          {field.type === "long_text" && (
            <div>
              {field.description && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-2">
                  <p className="text-[12px] font-semibold text-purple-700">
                    📋 Brief: &ldquo;{field.description}&rdquo;
                  </p>
                </div>
              )}
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] resize-none transition-all"
                rows={5}
                placeholder={field.placeholder}
                value={(values[field.id] as string) ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
              {field.validation?.maxWords && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Max. {field.validation.maxWords} words
                </p>
              )}
            </div>
          )}

          {/* Text (short_text) */}
          {field.type === "short_text" && (
            <div>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all"
                placeholder={field.placeholder}
                value={(values[field.id] as string) ?? ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
              {field.validation?.maxWords && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Max. {field.validation.maxWords} words
                </p>
              )}
            </div>
          )}

          {/* Select */}
          {field.type === "select" && (
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7300E5]/30 focus:border-[#7300E5] transition-all bg-white"
              value={(values[field.id] as string) ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            >
              <option value="">Select an option…</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
