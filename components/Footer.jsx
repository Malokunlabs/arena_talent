import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="relative bg-[#0b0013] text-white">
      <div className="mb-10 footer_main padding_default width_wrap">
        <div className="pt-20 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <h1 className="text-3xl font-bold lg:text-4xl xl:text-5xl">
              Be the first to know
            </h1>
            <div className="mt-5 md:nt-0">
              <p className="mb-2 md:text-xl">Subscribe to Swashes</p>
              <div className="flex h-10 bg-white rounded-lg">
                <input
                  type="text"
                  className="px-3 w-full h-10 bg-gray-100 rounded-lg focus:outline-none"
                />
                <Link href={"https://malokunlabs.substack.com"} target="_blank">
                  <button className="w-40 h-10 text-xs rounded-lg primary_bg">
                    Subscribe Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 mt-12 md:grid-cols-2">
            <div className="flex flex-col items-center mb-5 md:items-start md:mb-0">
              <div className="relative lg:w-36">
                <Image
                  width={150}
                  height={180}
                  src="/icons/logo.svg"
                  alt="brand logo"
                  className="object-cover"
                />
              </div>
              <div className="flex gap-3 items-center mt-8 footer_social md:gap-5">
                <Link
                  href="https://instagram.com/_urgent2k?igsh=MWt1aWZ5amgwMXgxbQ=="
                  target="_blank"
                >
                  <div className="relative">
                    <Image
                      width={24}
                      height={24}
                      src="/icons/ig.svg"
                      alt="brand logo"
                      className="object-cover"
                    />
                  </div>
                </Link>
                <Link
                  href="https://x.com/Urgent2k_by_ML?t=xpAUglVtQTEsxPPSIzZQOg&s=09"
                  target="_blank"
                >
                  <div className="relative">
                    <Image
                      width={24}
                      height={24}
                      src="/icons/x.svg"
                      alt="brand logo"
                      className="object-cover"
                    />
                  </div>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/malokun-labs/"
                  target="_blank"
                >
                  <div className="relative">
                    <Image
                      width={24}
                      height={24}
                      src="/icons/linkedin.svg"
                      alt="brand logo"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3">
              <div className="flex flex-col gap-2">
                <p className="mb-3 text-sm font-semibold">PAGES</p>
                <Link href="/">
                  <p className="text-sm">Home</p>
                </Link>
                <Link href="/marketplace">
                  <p className="text-sm">Marketplace</p>
                </Link>
                <Link href="/contact">
                  <p className="text-sm">Contact Us</p>
                </Link>
                <Link href="/about">
                  <p className="text-sm">About Us</p>
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="mb-3 text-sm font-semibold">ACCOUNT</p>
                <Link href="/brands">
                  <p className="text-sm">For Brands</p>
                </Link>
                <Link href="/">
                  <p className="text-sm">Earners</p>
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="mb-3 text-sm font-semibold">ABOUT</p>
                <Link href="/faq">
                  <p className="text-sm">FAQs</p>
                </Link>
                <Link href="/privacy">
                  <p className="text-sm">Privacy Policy</p>
                </Link>
                <Link href="/terms">
                  <p className="text-sm">Terms and Conditions</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="padding_default width_wrap">
        <p className="py-5 mt-14 text-sm text-center border-t border-gray-800">
          &copy; {year} Get Urgent2K powered by Malokun Labs. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
