"use client";

import { useEffect, useRef, useState } from "react";
import { webrtcManager, CallInfo, CallState } from "@/lib/webrtc";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomingCall?: CallInfo | null;
  outgoingUserId?: string;
  outgoingCallType?: "audio" | "video";
}

export default function CallModal({
  isOpen,
  onClose,
  incomingCall,
  outgoingUserId,
  outgoingCallType,
}: CallModalProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    webrtcManager.onCallStateChange = setCallState;
    webrtcManager.onLocalStream = (stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    };
    webrtcManager.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    };

    if (outgoingUserId && outgoingCallType) {
      webrtcManager.initiateCall(outgoingUserId, outgoingCallType);
    }

    return () => {
      webrtcManager.onCallStateChange = undefined;
      webrtcManager.onLocalStream = undefined;
      webrtcManager.onRemoteStream = undefined;
    };
  }, [outgoingUserId, outgoingCallType]);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (incomingCall) {
      webrtcManager.acceptCall(
        incomingCall.callId,
        incomingCall.sdp || "",
        incomingCall.callType
      );
    }
  };

  const handleReject = () => {
    if (incomingCall) webrtcManager.rejectCall(incomingCall.callId);
    onClose();
  };

  const handleEnd = () => {
    webrtcManager.endCall();
    onClose();
  };

  const isVideoCall =
    outgoingCallType === "video" || incomingCall?.callType === "video";

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center">
      <button
        onClick={handleEnd}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
      >
        <X size={24} />
      </button>

      <div className="text-center mb-8">
        <p className="text-white text-xl font-semibold">
          {callState === "incoming" &&
            `Incoming ${incomingCall?.callType} call from ${incomingCall?.callerName}`}
          {callState === "outgoing" && "Calling..."}
          {callState === "connected" && "Connected"}
          {callState === "ended" && "Call Ended"}
        </p>
      </div>

      {isVideoCall && (
        <div className="relative w-full max-w-4xl aspect-video mb-8">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full rounded-xl bg-gray-800 object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-48 h-36 rounded-lg bg-gray-700 object-cover border-2 border-white"
          />
        </div>
      )}

      {!isVideoCall && callState === "connected" && (
        <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center mb-8 animate-pulse">
          <Phone size={48} className="text-white" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {callState === "incoming" && (
          <>
            <button
              onClick={handleAccept}
              className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Phone size={28} />
            </button>
            <button
              onClick={handleReject}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff size={28} />
            </button>
          </>
        )}

        {callState === "connected" && (
          <>
            <button
              onClick={() => setIsMuted(webrtcManager.toggleMute())}
              className={`p-3 rounded-full ${isMuted ? "bg-red-500" : "bg-white/20"} text-white`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            {isVideoCall && (
              <button
                onClick={() => setIsVideoOff(webrtcManager.toggleVideo())}
                className={`p-3 rounded-full ${isVideoOff ? "bg-red-500" : "bg-white/20"} text-white`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
            )}
            <button
              onClick={handleEnd}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff size={28} />
            </button>
          </>
        )}

        {callState === "outgoing" && (
          <button
            onClick={handleEnd}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff size={28} />
          </button>
        )}
      </div>
    </div>
  );
}
