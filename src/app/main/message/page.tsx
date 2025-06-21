"use client";

import { MODULES_AND_PERMISSIONS } from "@/lib/constants";
import { hasPermission } from "@/lib/utils";
import { useGetMyPermissions } from "@/query/miscellaneous";
import { Message, getMessage, updateMessage } from "@/services/miscellaneous";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MessageManager = () => {
  const {
    data: myPermissions,
    isFetching: isFetchingMyPermissions,
    isPending: isPendingMyPermissions,
  } = useGetMyPermissions();

  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const fetchedMessage = await getMessage();
        setMessage(fetchedMessage);
        setDraftContent(fetchedMessage.content);
      } catch (err) {
        console.error("Error fetching message:", err);
        setError("Failed to load message. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await updateMessage(draftContent);
      setMessage({ content: draftContent });
      setEditMode(false);
      toast.success("Message updated!");
    } catch (err) {
      console.error("Error updating message:", err);
      toast.error("Failed to update message. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (isFetchingMyPermissions || isPendingMyPermissions) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-700 animate-pulse text-center">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.MESSAGE.PERMISSION_READ.name
    ) ||
    !hasPermission(
      myPermissions!,
      MODULES_AND_PERMISSIONS.MESSAGE.PERMISSION_UPDATE.name
    )
  ) {
    return (
      <p className="mt-10 text-center text-red-600 text-lg">
        You are not permitted to manage this message.
      </p>
    );
  }

  if (loading || updating) {
    return (
      <div className="w-full min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-600 animate-pulse text-center">
          {loading ? "Loading message..." : "Updating message..."}
        </p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 mt-10 text-lg">{error}</p>;
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-zinc-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow p-6 space-y-6">
        <h1 className="text-xl font-semibold text-red-600">
          📢 Public Message
        </h1>

        {editMode ? (
          <div className="space-y-4">
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full min-h-[150px] p-4 border border-zinc-300 rounded-xl text-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Edit your message here..."
            />
            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl transition disabled:opacity-60"
              >
                Update Message
              </button>
              <button
                onClick={() => {
                  setDraftContent(message?.content || "");
                  setEditMode(false);
                }}
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium px-5 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-zinc-700 whitespace-pre-line">
              {message?.content}
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-xl transition"
            >
              Edit Message
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MessageManager;
