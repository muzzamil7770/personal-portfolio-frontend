import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingLinkService {
  private readonly baseUrl = window.location.origin;

  generateMeetingLink(roomId: string): { link: string; expiresAt: Date } {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Valid for 1 hour

    const link = `${this.baseUrl}/video-call/${roomId}`;

    // Store in localStorage for tracking (in production, use backend)
    const meetingData = {
      roomId,
      link,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };

    const existingMeetings = this.getStoredMeetings();
    existingMeetings.push(meetingData);
    localStorage.setItem('active-meetings', JSON.stringify(existingMeetings));

    return { link, expiresAt };
  }

  getStoredMeetings() {
    try {
      const stored = localStorage.getItem('active-meetings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  isLinkValid(roomId: string): boolean {
    const meetings = this.getStoredMeetings();
    const meeting = meetings.find((m: any) => m.roomId === roomId);

    if (!meeting) return false;

    const expiresAt = new Date(meeting.expiresAt);
    return new Date() < expiresAt;
  }

  cleanupExpiredMeetings() {
    const meetings = this.getStoredMeetings();
    const validMeetings = meetings.filter((m: any) => {
      const expiresAt = new Date(m.expiresAt);
      return new Date() < expiresAt;
    });

    localStorage.setItem('active-meetings', JSON.stringify(validMeetings));
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}