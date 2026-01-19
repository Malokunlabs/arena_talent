"use client";

import React from "react";
import Image from "next/image";
import { Copy, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProofDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: {
    image: string;
    rank: number;
    name: string;
    avatar: string;
    proofboardLink: string;
  } | null;
}

export default function ProofDetailModal({
  isOpen,
  onClose,
  proof,
}: ProofDetailModalProps) {
  if (!proof) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-none rounded-3xl sm:max-w-lg">
        <DialogTitle className="sr-only">Proof Details</DialogTitle>
        <div className="relative aspect-video w-full bg-gray-100">
          <Image
            src={proof.image}
            alt={`Proof by ${proof.name}`}
            fill
            className="object-cover"
          />
          <DialogClose className="absolute top-4 right-4 rounded-full bg-white p-2 text-gray-900 transition-opacity hover:bg-gray-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div className="p-6 text-center space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-gray-900">
              Share Your Proof (+3 Pt)
            </h3>
            <p className="text-sm text-gray-500">
              Amplify your progress and earn +3 Pt for each share!
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            {/* Instagram */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 bg-linear-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </button>

            {/* WhatsApp */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 bg-[#25D366]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>

            {/* X (Twitter) */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 bg-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Copy Link */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 bg-gray-500">
              <Copy className="w-6 h-6" />
            </button>
          </div>

          <div className="text-sm">
            <span className="text-gray-500">Your public proofboard: </span>
            <span className="text-primary font-semibold">
              {proof.proofboardLink}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={proof.avatar}
              alt={proof.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-sm text-gray-900">
              {proof.name}
            </span>
            <span className="text-xs text-gray-500">
              Reached 100 completed gigs milestone
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
