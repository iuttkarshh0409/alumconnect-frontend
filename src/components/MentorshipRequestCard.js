import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MentorshipRequestCard = ({ request, userRole, onUpdate }) => {
  const { getToken } = useAuth();

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
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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

  return (
    <div
      data-testid={`mentorship-request-card-${request.request_id}`}
      className={`bg-white rounded-lg border-l-4 ${getStatusColor()} shadow-sm p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className="font-semibold text-[#002147] capitalize">
              {request.status}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-[#002147] mb-1">
            {request.topic}
          </h4>
          {displayUser && (
            <p className="text-sm text-slate-600">
              {userRole === "student" ? "Mentor" : "Student"}:{" "}
              {displayUser.name}
            </p>
          )}
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{format(new Date(request.created_at), "MMM dd, yyyy")}</p>
          {request.status === "pending" && (
            <p className="text-xs text-yellow-600 mt-1">
              Expires: {format(new Date(request.expires_at), "MMM dd")}
            </p>
          )}
        </div>
      </div>

      <p className="text-slate-700 mb-4">{request.description}</p>

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
            className="border-red-600 text-red-600 hover:bg-red-50 rounded-full flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      )}

      {request.status === "accepted" && displayUser && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-green-800 mb-1 font-medium">
            Contact Information
          </p>
          <p className="text-sm text-green-700">{displayUser.email}</p>
        </div>
      )}
    </div>
  );
};

export default MentorshipRequestCard;
