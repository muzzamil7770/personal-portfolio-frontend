import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';

export type ConnectionStatus = 'online' | 'offline' | 'pending';

export interface SystemHealth {
  firebase: ConnectionStatus;
  api: ConnectionStatus;
  socket: ConnectionStatus;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private healthSource = new BehaviorSubject<SystemHealth>({
    firebase: 'pending',
    api: 'pending',
    socket: 'pending'
  });

  health$ = this.healthSource.asObservable();

  constructor(private http: HttpClient, private socketService: SocketService) {
    this.monitorSocket();
    this.monitorApi();
    this.monitorFirebase();
  }

  private monitorSocket() {
    this.socketService.connected$.subscribe(connected => {
      this.updateStatus('socket', connected ? 'online' : 'offline');
    });
  }

  private monitorApi() {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.http.get(`${environment.apiUrl}/analytics/live`).pipe(
        map(() => 'online' as ConnectionStatus),
        catchError(() => of('offline' as ConnectionStatus))
      ))
    ).subscribe(status => {
      this.updateStatus('api', status);
    });
  }

  private monitorFirebase() {
    // Check via backend since only backend talks to firebase directly in this architecture
    interval(60000).pipe(
      startWith(0),
      switchMap(() => this.http.get(`${environment.apiUrl}/analytics/stats`).pipe(
        map(() => 'online' as ConnectionStatus),
        catchError(() => of('offline' as ConnectionStatus))
      ))
    ).subscribe(status => {
      this.updateStatus('firebase', status);
    });
  }

  private updateStatus(key: keyof SystemHealth, status: ConnectionStatus) {
    const current = this.healthSource.value;
    if (current[key] !== status) {
      this.healthSource.next({ ...current, [key]: status });
    }
  }
}
