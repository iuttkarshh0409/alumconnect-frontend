import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { Clock, CheckCircle, XCircle, AlertCircle, Trash2, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import ChatSheet from "@/components/ChatSheet";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MentorshipRequestCard = ({ request, userRole, onUpdate }) => {
  const { getToken } = useAuth();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [conversationId, setConversationId] = React.useState(null);

  const handleOpenChat = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convo = res.data.find((c) => c.request_id === request.request_id);
      if (convo) {
        setConversationId(convo.conversation_id);
        setChatOpen(true);
      } else {
        toast.error("Conversation not found");
      }
    } catch (error) {
      toast.error("Failed to load chat setup");
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const token = await getToken();

      await axios.put(
        `${API_URL}/api/mentorship/requests/${request.request_id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Request ${status}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (request.status) {
      case "pending":
        return "border-l-yellow-500";
      case "accepted":
        return "border-l-green-500";
      case "rejected":
        return "border-l-red-500";
      case "expired":
        return "border-l-gray-500";
      default:
        return "border-l-[#4A6C6F]";
    }
  };

  const displayUser =
    userRole === "student" ? request.mentor : request.student;

  const handleWithdraw = async () => {
    try {
      const token = await getToken();
      await axios.delete(
        `${API_URL}/api/mentorship/requests/${request.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Request withdrawn");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to withdraw request");
    }
  };

  return (
    <div
      data-testid={`mentorship-request-card-${request.request_id}`}
      className={`bg-white dark:bg-slate-900 rounded-lg border-l-4 ${getStatusColor()} shadow-sm p-6 hover:shadow-md transition-shadow dark:border-opacity-80 transition-colors duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="font-semibold text-[#002147] dark:text-slate-200 capitalize">
              {request.status}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-[#002147] dark:text-white mb-1">
            {request.topic}
          </h4>
          {displayUser && (
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-tight">
              {userRole === "student" ? "Mentor" : "Student"}:{" "}
              {displayUser.name}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 text-sm text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-4">
            {userRole === "student" && request.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-2 font-bold text-[10px] transition-all active:scale-95 border border-red-100/30 dark:border-red-900/30 hover:border-red-100 dark:hover:border-red-900"
                onClick={handleWithdraw}
              >
                <Trash2 className="w-3 h-3" />
                Withdraw Request
              </Button>
            )}
            <p className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(request.created_at), "MMM dd, yyyy")}
            </p>
          </div>
          {request.status === "pending" && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500/80 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires: {format(new Date(request.expires_at), "MMM dd")}
            </p>
          )}
        </div>
      </div>

      <p className="text-slate-700 dark:text-slate-300 mb-4 tracking-tight leading-relaxed">{request.description}</p>

      {userRole === "alumni" && request.status === "pending" && (
        <div className="flex gap-2">
          <Button
            data-testid={`accept-request-btn-${request.request_id}`}
            onClick={() => handleUpdateStatus("accepted")}
            className="bg-green-600 text-white hover:bg-green-700 rounded-full flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            data-testid={`reject-request-btn-${request.request_id}`}
            onClick={() => handleUpdateStatus("rejected")}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      )}

      {request.status === "accepted" && displayUser && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3 mt-4 transition-colors flex justify-between items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-green-800 dark:text-green-400 mb-1 font-bold tracking-tight uppercase text-[10px]">
              Next Step
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium leading-relaxed">
              ✅ Connection Established! Click Message to introduce yourself and coordinate session timings.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleOpenChat}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 font-bold text-xs"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>
      )}
      <ChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={conversationId}
        otherParticipant={displayUser}
      />
    </div>
  );
};

export default MentorshipRequestCard;
