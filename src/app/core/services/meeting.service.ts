import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ActiveMeeting {
  id: string;
  roomId: string;
  title: string;
  participants: number;
  startTime: Date;
  status: 'active' | 'waiting' | 'ended';
  adminId: string;
  link: string;
  expiresAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private activeMeetings = new BehaviorSubject<ActiveMeeting[]>([]);
  activeMeetings$ = this.activeMeetings.asObservable();

  private currentMeeting = new BehaviorSubject<ActiveMeeting | null>(null);
  currentMeeting$ = this.currentMeeting.asObservable();

  constructor() {
    this.loadMeetingsFromStorage();
  }

  createMeeting(title: string, adminId: string): ActiveMeeting {
    const roomId = this.generateRoomId();
    const meeting: ActiveMeeting = {
      id: `meeting_${Date.now()}`,
      roomId,
      title,
      participants: 1,
      startTime: new Date(),
      status: 'waiting',
      adminId,
      link: `${window.location.origin}/video-call/${roomId}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };

    const current = this.activeMeetings.value;
    current.push(meeting);
    this.activeMeetings.next([...current]);
    this.saveMeetingsToStorage();

    return meeting;
  }

  updateMeetingStatus(roomId: string, status: ActiveMeeting['status'], participants?: number) {
    const current = this.activeMeetings.value;
    const meeting = current.find(m => m.roomId === roomId);
    if (meeting) {
      meeting.status = status;
      if (participants !== undefined) {
        meeting.participants = participants;
      }
      this.activeMeetings.next([...current]);
      this.saveMeetingsToStorage();
    }
  }

  endMeeting(roomId: string) {
    const current = this.activeMeetings.value;
    const updated = current.filter(m => m.roomId !== roomId);
    this.activeMeetings.next(updated);
    this.saveMeetingsToStorage();

    if (this.currentMeeting.value?.roomId === roomId) {
      this.currentMeeting.next(null);
    }
  }

  getActiveMeeting(roomId: string): ActiveMeeting | null {
    return this.activeMeetings.value.find(m => m.roomId === roomId && m.status === 'active') || null;
  }

  setCurrentMeeting(meeting: ActiveMeeting | null) {
    this.currentMeeting.next(meeting);
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private saveMeetingsToStorage() {
    try {
      localStorage.setItem('active-meetings-admin', JSON.stringify(this.activeMeetings.value));
    } catch (e) {
      console.warn('Failed to save meetings to storage');
    }
  }

  private loadMeetingsFromStorage() {
    try {
      const stored = localStorage.getItem('active-meetings-admin');
      if (stored) {
        const meetings = JSON.parse(stored);
        // Filter out expired meetings
        const validMeetings = meetings.filter((m: any) => new Date(m.expiresAt) > new Date());
        this.activeMeetings.next(validMeetings);
      }
    } catch (e) {
      console.warn('Failed to load meetings from storage');
    }
  }

  cleanupExpiredMeetings() {
    const current = this.activeMeetings.value;
    const validMeetings = current.filter(m => new Date(m.expiresAt) > new Date());
    if (validMeetings.length !== current.length) {
      this.activeMeetings.next(validMeetings);
      this.saveMeetingsToStorage();
    }
  }
}