import { socketManager } from "./socket";

export type CallType = "audio" | "video";
export type CallState = "idle" | "outgoing" | "incoming" | "connected" | "ended";

export interface CallInfo {
  callId: string;
  callerId: string;
  callerName: string;
  callType: CallType;
  sdp?: string;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private currentCallId = "";

  onCallStateChange?: (state: CallState) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onLocalStream?: (stream: MediaStream) => void;
  onIncomingCall?: (info: CallInfo) => void;

  init() {
    socketManager.on("call_incoming", (data: unknown) => {
      const d = data as CallInfo;
      this.currentCallId = d.callId;
      this.onIncomingCall?.(d);
      this.onCallStateChange?.("incoming");
    });

    socketManager.on("call_accepted", async (data: unknown) => {
      const d = data as { call_id: string; sdp: string };
      if (this.pc) {
        await this.pc.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: d.sdp })
        );
        this.onCallStateChange?.("connected");
      }
    });

    socketManager.on("call_rejected", () => {
      this.onCallStateChange?.("ended");
      this.cleanup();
    });

    socketManager.on("call_ended", () => {
      this.onCallStateChange?.("ended");
      this.cleanup();
    });

    socketManager.on("ice_candidate", async (data: unknown) => {
      const d = data as { candidate: string };
      if (this.pc && d.candidate) {
        try {
          await this.pc.addIceCandidate(
            new RTCIceCandidate(JSON.parse(d.candidate))
          );
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    });
  }

  private async createPeerConnection() {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketManager.emit("ice_candidate", {
          call_id: this.currentCallId,
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    this.pc.ontrack = (event) => {
      this.onRemoteStream?.(event.streams[0]);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.pc!.addTrack(track, this.localStream!);
      });
    }
  }

  async initiateCall(targetUserId: string, callType: CallType) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      this.onLocalStream?.(this.localStream);

      await this.createPeerConnection();
      const offer = await this.pc!.createOffer();
      await this.pc!.setLocalDescription(offer);

      socketManager.emit("initiate_call", {
        target_user_id: targetUserId,
        call_type: callType,
        sdp: offer.sdp,
      });

      this.onCallStateChange?.("outgoing");
    } catch (e) {
      console.error("Failed to initiate call:", e);
      this.cleanup();
    }
  }

  async acceptCall(callId: string, remoteSdp: string, callType: CallType) {
    try {
      this.currentCallId = callId;
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      this.onLocalStream?.(this.localStream);

      await this.createPeerConnection();
      await this.pc!.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: remoteSdp })
      );

      const answer = await this.pc!.createAnswer();
      await this.pc!.setLocalDescription(answer);

      socketManager.emit("accept_call", {
        call_id: callId,
        sdp: answer.sdp,
      });

      this.onCallStateChange?.("connected");
    } catch (e) {
      console.error("Failed to accept call:", e);
      this.cleanup();
    }
  }

  rejectCall(callId: string) {
    socketManager.emit("reject_call", { call_id: callId });
    this.cleanup();
  }

  endCall() {
    socketManager.emit("end_call", { call_id: this.currentCallId });
    this.cleanup();
  }

  toggleMute(): boolean {
    const audioTrack = this.localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled;
    }
    return false;
  }

  private cleanup() {
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
    this.currentCallId = "";
  }
}

export const webrtcManager = new WebRTCManager();
