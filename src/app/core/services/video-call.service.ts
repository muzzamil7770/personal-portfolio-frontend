import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Participant {
    id: string;
    stream: MediaStream | null;
    name: string;
    email?: string;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    isAllowed: boolean;
    isScreenSharing?: boolean;
    notes?: string;
}

@Injectable({ providedIn: 'root' })
export class VideoCallService {
    private socket: Socket;
    private peerConnections: { [peerId: string]: RTCPeerConnection } = {};
    private currentRoomId = '';

    private participantsSource = new BehaviorSubject<Participant[]>([]);
    participants$ = this.participantsSource.asObservable();

    private localStreamSource = new BehaviorSubject<MediaStream | null>(null);
    localStream$ = this.localStreamSource.asObservable();

    private screenStreamSource = new BehaviorSubject<MediaStream | null>(null);
    screenStream$ = this.screenStreamSource.asObservable();

    private onKickedSource = new Subject<void>();
    onKicked$ = this.onKickedSource.asObservable();

    private iceConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    constructor() {
        this.socket = io(environment.apiUrl.replace('/api', ''), { autoConnect: true });
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        // Guest sent a join request — admin sees this
        this.socket.on('join-request', ({ userId, name, email }: any) => {
            const list = this.participantsSource.value;
            if (!list.find(p => p.id === userId)) {
                this.participantsSource.next([
                    ...list,
                    { id: userId, stream: null, name, email, isAudioMuted: false, isVideoMuted: false, isAllowed: false }
                ]);
            }
        });

        // Admin allowed a user — both admin and guest receive this
        this.socket.on('user-allowed', async (userId: string) => {
            const list = this.participantsSource.value;
            const p = list.find(x => x.id === userId);
            if (p) p.isAllowed = true;
            this.participantsSource.next([...list]);

            // If I am the admin (not the one being allowed), initiate WebRTC to the new user
            if (userId !== this.socket.id) {
                await this.initiateOffer(userId);
            }
        });

        // Received an offer from another peer
        this.socket.on('offer', async ({ caller, offer }: any) => {
            const pc = this.getOrCreatePeerConnection(caller);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.socket.emit('answer', { target: caller, answer });
        });

        // Received an answer to our offer
        this.socket.on('answer', async ({ caller, answer }: any) => {
            const pc = this.peerConnections[caller];
            if (pc && pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        // ICE candidate from a peer
        this.socket.on('ice-candidate', async ({ caller, candidate }: any) => {
            const pc = this.peerConnections[caller];
            if (pc) {
                try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (_) {}
            }
        });

        this.socket.on('user-disconnected', (userId: string) => {
            this.removePeer(userId);
        });

        this.socket.on('notes-update', ({ userId, notes }: any) => {
            const list = this.participantsSource.value;
            const p = list.find(x => x.id === userId);
            if (p) { p.notes = notes; this.participantsSource.next([...list]); }
        });

        this.socket.on('screen-share-started', (userId: string) => {
            const list = this.participantsSource.value;
            const p = list.find(x => x.id === userId);
            if (p) { p.isScreenSharing = true; this.participantsSource.next([...list]); }
        });

        this.socket.on('screen-share-stopped', (userId: string) => {
            const list = this.participantsSource.value;
            const p = list.find(x => x.id === userId);
            if (p) { p.isScreenSharing = false; this.participantsSource.next([...list]); }
        });

        this.socket.on('mute-instruction', ({ userId, mute }: any) => {
            if (userId === this.socket.id) {
                this.toggleLocalAudio(!mute);
            }
        });

        this.socket.on('user-kicked', (userId: string) => {
            if (userId === this.socket.id) {
                this.onKickedSource.next();
            } else {
                this.removePeer(userId);
            }
        });
    }

    private async initiateOffer(targetId: string) {
        const pc = this.getOrCreatePeerConnection(targetId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.socket.emit('offer', { target: targetId, offer, caller: this.socket.id });
    }

    private getOrCreatePeerConnection(peerId: string): RTCPeerConnection {
        if (this.peerConnections[peerId]) return this.peerConnections[peerId];

        const pc = new RTCPeerConnection(this.iceConfig);
        this.peerConnections[peerId] = pc;

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                this.socket.emit('ice-candidate', { target: peerId, caller: this.socket.id, candidate: e.candidate });
            }
        };

        pc.ontrack = (e) => {
            this.upsertParticipantStream(peerId, e.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                this.removePeer(peerId);
            }
        };

        // Add local tracks to this connection
        const local = this.localStreamSource.value;
        if (local) {
            local.getTracks().forEach(track => pc.addTrack(track, local));
        }

        return pc;
    }

    private upsertParticipantStream(peerId: string, stream: MediaStream) {
        const list = this.participantsSource.value;
        const p = list.find(x => x.id === peerId);
        if (p) {
            p.stream = stream;
        } else {
            list.push({ id: peerId, stream, name: 'Guest', isAudioMuted: false, isVideoMuted: false, isAllowed: true });
        }
        this.participantsSource.next([...list]);
    }

    private removePeer(peerId: string) {
        if (this.peerConnections[peerId]) {
            this.peerConnections[peerId].close();
            delete this.peerConnections[peerId];
        }
        this.participantsSource.next(this.participantsSource.value.filter(p => p.id !== peerId));
    }

    // ── Public API ──────────────────────────────────────────────

    async startLocalStream(): Promise<void> {
        if (this.localStreamSource.value) return; // already started
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.localStreamSource.next(stream);
        } catch {
            // Try audio only if camera fails
            const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            this.localStreamSource.next(stream);
        }
    }

    joinRoom(roomId: string, name: string, isAdmin: boolean, email?: string) {
        this.currentRoomId = roomId;
        // Reset participants for this room
        this.participantsSource.next([]);

        if (isAdmin) {
            this.socket.emit('join-room', roomId, this.socket.id);
            this.socket.emit('live-meeting-start', { roomId });
        } else {
            this.socket.emit('join-request', { roomId, userId: this.socket.id, name, email });
        }
    }

    leaveRoom() {
        // Close all peer connections
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
        this.participantsSource.next([]);

        // Stop local stream
        this.localStreamSource.value?.getTracks().forEach(t => t.stop());
        this.localStreamSource.next(null);

        // Stop screen share
        this.screenStreamSource.value?.getTracks().forEach(t => t.stop());
        this.screenStreamSource.next(null);
    }

    endMeeting() {
        this.socket.emit('live-meeting-end');
        this.leaveRoom();
    }

    toggleLocalAudio(enabled: boolean) {
        this.localStreamSource.value?.getAudioTracks().forEach(t => t.enabled = enabled);
    }

    toggleLocalVideo(enabled: boolean) {
        this.localStreamSource.value?.getVideoTracks().forEach(t => t.enabled = enabled);
    }

    async startScreenShare(): Promise<void> {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        this.screenStreamSource.next(screen);
        screen.getVideoTracks()[0].addEventListener('ended', () => this.stopScreenShare());
        this.replaceVideoTrack(screen.getVideoTracks()[0]);
    }

    stopScreenShare() {
        const screen = this.screenStreamSource.value;
        if (!screen) return;
        screen.getTracks().forEach(t => t.stop());
        this.screenStreamSource.next(null);
        const camTrack = this.localStreamSource.value?.getVideoTracks()[0];
        if (camTrack) this.replaceVideoTrack(camTrack);
    }

    private replaceVideoTrack(track: MediaStreamTrack) {
        Object.values(this.peerConnections).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(track);
        });
    }

    allowUser(roomId: string, userId: string) {
        this.socket.emit('admin-allow-user', { roomId, userId });
    }

    muteUser(roomId: string, userId: string, mute: boolean) {
        this.socket.emit('admin-mute-user', { roomId, userId, mute });
    }

    kickUser(roomId: string, userId: string) {
        this.socket.emit('admin-kick-user', { roomId, userId });
    }

    updateNotes(roomId: string, notes: string) {
        this.socket.emit('update-notes', { roomId, notes });
    }

    startScreenShareBroadcast(roomId: string) {
        this.socket.emit('start-screen-share', roomId);
    }

    stopScreenShareBroadcast(roomId: string) {
        this.socket.emit('stop-screen-share', roomId);
    }

    generateLink(roomId: string): string {
        return `${window.location.origin}/video-call/${roomId}`;
    }

    getSocketId(): string {
        return this.socket.id || '';
    }
}
