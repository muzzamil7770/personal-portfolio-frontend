import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

export interface LiveMeeting {
  active: boolean;
  roomId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  public calendarUpdates$ = new Subject<any>();
  public notifications$ = new Subject<any>();
  private connectedSource = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSource.asObservable();
  private liveMeetingSource = new BehaviorSubject<LiveMeeting>({ active: false, roomId: null });
  public liveMeeting$ = this.liveMeetingSource.asObservable();

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''));

    this.socket.on('calendar-update', (data: any) => {
      this.calendarUpdates$.next(data);
    });

    this.socket.on('live-watching-update', (data: any) => {
      this.calendarUpdates$.next(data);
    });

    this.socket.on('live-meeting-update', (data: LiveMeeting) => {
      this.liveMeetingSource.next(data);
    });

    this.socket.on('new-notification', (data: any) => {
      this.notifications$.next(data);
      // Only show native push if it's a success event
      if (data.status === 'success' || !data.status) {
        this.showPushNotification(data.title, data.message);
      }
    });

    this.socket.on('connect', () => {
      this.connectedSource.next(true);
      console.log('Connected to socket server');
      const sessionId = document.cookie.split('; ').find(row => row.startsWith('_vsid='))?.split('=')[1];
      if (sessionId) {
        this.socket.emit('join-watching', { sessionId });
      }
    });

    this.socket.on('disconnect', () => {
      this.connectedSource.next(false);
    });

    this.requestNotificationPermission();
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  private showPushNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/assets/icons/favicon.png' // Adjust if needed
      });
    }
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}
