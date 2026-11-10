"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Search, Users, X } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import NotificationPopover from "@/components/NotificationPopover";
import { LevelPill } from "@/components/arena/LevelBadge";
import {
  connectionService,
  ConnectionRequestItem,
  PeopleYouMayKnowItem,
} from "@/services/connectionService";
import { toast } from "sonner";

interface ProfileRightSidebarProps {
  onRequestsCountChange?: (count: number) => void;
  onConnectionAccepted?: () => void;
}

export default function ProfileRightSidebar({
  onRequestsCountChange,
  onConnectionAccepted,
}: ProfileRightSidebarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const [requests, setRequests] = useState<ConnectionRequestItem[]>([]);
  const [suggestions, setSuggestions] = useState<PeopleYouMayKnowItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const [actingRequestId, setActingRequestId] = useState<string | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [pendingUserIds, setPendingUserIds] = useState<Record<string, boolean>>(
    {},
  );

  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);

  const loadData = async () => {
    setLoadingRequests(true);
    setLoadingSuggestions(true);
    try {
      const [reqs, suggs] = await Promise.all([
        connectionService.getIncomingRequests(20),
        connectionService.getSuggestions(10),
      ]);
      const reqList = Array.isArray(reqs) ? reqs : [];
      setRequests(reqList);
      setSuggestions(Array.isArray(suggs) ? suggs : []);
      onRequestsCountChange?.(reqList.length);
    } catch {
      setRequests([]);
      setSuggestions([]);
    } finally {
      setLoadingRequests(false);
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
  };

  const handleAccept = async (requestId: string) => {
    setActingRequestId(requestId);
    try {
      await connectionService.acceptRequest(requestId);
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        onRequestsCountChange?.(next.length);
        return next;
      });
      toast.success("Connection request accepted!");
      onConnectionAccepted?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to accept request";
      toast.error(message);
    } finally {
      setActingRequestId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setActingRequestId(requestId);
    try {
      await connectionService.declineRequest(requestId);
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        onRequestsCountChange?.(next.length);
        return next;
      });
      toast.success("Request declined");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to decline request";
      toast.error(message);
    } finally {
      setActingRequestId(null);
    }
  };

  const handleConnect = async (userId: string) => {
    if (pendingUserIds[userId]) return;
    setConnectingUserId(userId);
    try {
      await connectionService.sendRequest(userId);
      setPendingUserIds((prev) => ({ ...prev, [userId]: true }));
      toast.success("Connection request sent!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send request";
      toast.error(message);
    } finally {
      setConnectingUserId(null);
    }
  };

  const visibleRequests = requests.slice(0, 3);
  const visibleSuggestions = suggestions.slice(0, 3);

  return (
    <>
      {/* Top Search Arena + Notification Bell */}
      <div className="flex items-center gap-2.5">
        <form onSubmit={handleGlobalSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-[#747682] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Arena"
            className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-[#E6E6EC] text-[13px] text-black placeholder:text-[#747682] outline-none focus:border-[#7E00EE] transition-colors"
          />
        </form>
        <div className="w-10 h-10 rounded-xl border border-[#E6E6EC] flex items-center justify-center shrink-0">
          <NotificationPopover isAdmin={false} />
        </div>
      </div>

      {/* Connection Requests Card */}
      <div className="rounded-2xl border border-[#EFEFF3] bg-white p-4">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[13.5px] font-semibold text-black">
            Connection Requests
          </h3>
          {requests.length > 0 && (
            <button
              type="button"
              onClick={() => setRequestsModalOpen(true)}
              className="text-[#747682] hover:text-black transition-colors cursor-pointer"
              title="View all connection requests"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {loadingRequests ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-7 w-16 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : visibleRequests.length === 0 ? (
          <p className="text-[12.5px] text-[#747682] py-2">
            No pending connection requests right now.
          </p>
        ) : (
          <div className="space-y-3.5">
            {visibleRequests.map((req) => {
              const person = req.requester;
              const fullName = `${person.firstName} ${person.lastName}`.trim();
              const profileHref = person.username
                ? `/profile?username=${encodeURIComponent(person.username)}`
                : undefined;

              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={fullName}
                      src={person.avatarUrl}
                      size={36}
                    />
                    <div className="min-w-0">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="block text-[13px] font-semibold text-black truncate hover:text-[#7E00EE] transition-colors"
                        >
                          {fullName}
                        </Link>
                      ) : (
                        <p className="text-[13px] font-semibold text-black truncate">
                          {fullName}
                        </p>
                      )}
                      <div className="mt-0.5">
                        <LevelPill level={person.level} size="xs" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={actingRequestId === req.id}
                      onClick={() => handleAccept(req.id)}
                      className="h-8 px-3 rounded-lg border border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-[12px] font-medium text-black transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      {actingRequestId === req.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={actingRequestId === req.id}
                      onClick={() => handleDecline(req.id)}
                      className="w-7 h-8 rounded-lg text-[#747682] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                      title="Decline request"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* People You May Know Card */}
      <div className="rounded-2xl border border-[#EFEFF3] bg-white p-4">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[13.5px] font-semibold text-black">
            People you may know
          </h3>
          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setSuggestionsModalOpen(true)}
              className="text-[#747682] hover:text-black transition-colors cursor-pointer"
              title="See more people you may know"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {loadingSuggestions ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-7 w-16 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : visibleSuggestions.length === 0 ? (
          <p className="text-[12.5px] text-[#747682] py-2">
            No talent suggestions available yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {visibleSuggestions.map((item) => {
              const person = item.talent;
              const fullName = `${person.firstName} ${person.lastName}`.trim();
              const isPending = !!pendingUserIds[person.id];
              const profileHref = person.username
                ? `/profile?username=${encodeURIComponent(person.username)}`
                : undefined;

              return (
                <div
                  key={person.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={fullName}
                      src={person.avatarUrl}
                      size={36}
                    />
                    <div className="min-w-0">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="block text-[13px] font-semibold text-black truncate hover:text-[#7E00EE] transition-colors"
                        >
                          {fullName}
                        </Link>
                      ) : (
                        <p className="text-[13px] font-semibold text-black truncate">
                          {fullName}
                        </p>
                      )}
                      <div className="mt-0.5">
                        <LevelPill level={person.level} size="xs" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={connectingUserId === person.id || isPending}
                    onClick={() => handleConnect(person.id)}
                    className={`h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors shrink-0 inline-flex items-center gap-1 ${
                      isPending
                        ? "border-[#E5E7EB] bg-[#F5F5F7] text-[#747682] cursor-default"
                        : "border-[#E5E7EB] bg-white hover:border-black hover:bg-gray-50 text-black cursor-pointer"
                    }`}
                  >
                    {connectingUserId === person.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isPending ? (
                      <>
                        <Check className="w-3 h-3" /> Pending
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Connection Requests Modal */}
      {requestsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRequestsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-[460px] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EFEFF3]">
              <h2 className="text-[18px] font-semibold text-black">
                Connection Requests
              </h2>
              <button
                type="button"
                onClick={() => setRequestsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[#747682] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {requests.length === 0 ? (
                <p className="text-[13.5px] text-[#747682] text-center py-8">
                  All caught up! No pending requests.
                </p>
              ) : (
                requests.map((req) => {
                  const person = req.requester;
                  const fullName =
                    `${person.firstName} ${person.lastName}`.trim();
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={fullName}
                          src={person.avatarUrl}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-black truncate">
                            {fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <LevelPill level={person.level} size="xs" />
                            {person.location && (
                              <span className="text-[11.5px] text-[#747682] truncate">
                                {person.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={actingRequestId === req.id}
                          onClick={() => handleAccept(req.id)}
                          className="h-8 px-3 rounded-lg bg-[#7E00EE] hover:bg-[#6A00CC] text-white text-[12px] font-medium cursor-pointer disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={actingRequestId === req.id}
                          onClick={() => handleDecline(req.id)}
                          className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] text-[12px] font-medium text-[#747682] hover:text-black hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* All People You May Know Modal */}
      {suggestionsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSuggestionsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-[460px] max-h-[82vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EFEFF3]">
              <h2 className="text-[18px] font-semibold text-black">
                People you may know
              </h2>
              <button
                type="button"
                onClick={() => setSuggestionsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[#747682] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-[13.5px] text-[#747682]">
                    No talent suggestions found.
                  </p>
                </div>
              ) : (
                suggestions.map((item) => {
                  const person = item.talent;
                  const fullName =
                    `${person.firstName} ${person.lastName}`.trim();
                  const isPending = !!pendingUserIds[person.id];
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={fullName}
                          src={person.avatarUrl}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-black truncate">
                            {fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <LevelPill level={person.level} size="xs" />
                            <span className="text-[11.5px] text-[#747682] truncate">
                              {item.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={connectingUserId === person.id || isPending}
                        onClick={() => handleConnect(person.id)}
                        className={`h-8 px-3 rounded-lg border text-[12px] font-medium shrink-0 ${
                          isPending
                            ? "border-[#E5E7EB] bg-[#F5F5F7] text-[#747682]"
                            : "border-[#E5E7EB] bg-white hover:border-black text-black cursor-pointer"
                        }`}
                      >
                        {isPending ? "Pending" : "Connect"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
