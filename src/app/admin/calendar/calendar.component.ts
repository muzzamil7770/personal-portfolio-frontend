import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar } from '@fullcalendar/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
    selector: 'app-admin-calendar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="calendar-page-container">
      <div class="calendar-main glass">
        <div class="calendar-header-row">
            <div class="header-info">
                <h1><i class="fas fa-calendar-check"></i> Master Schedule</h1>
                <p>Manage appointments, virtual rooms, and your availability slots.</p>
            </div>
            <div class="header-actions">
                <button class="view-btn" [class.active]="currentView === 'timeGridWeek'" (click)="changeView('timeGridWeek')">Week</button>
                <button class="view-btn" [class.active]="currentView === 'dayGridMonth'" (click)="changeView('dayGridMonth')">Month</button>
                <button class="view-btn" [class.active]="currentView === 'listWeek'" (click)="changeView('listWeek')">List</button>
            </div>
        </div>
        <div #calendarEl class="fc-native-container"></div>
      </div>

      <div class="calendar-sidebar glass">
        <div class="sidebar-section" *ngIf="selectedEvent; else noEvent">
            <div class="section-title"><i class="fas fa-info-circle"></i> Appointment Details</div>
            <div class="event-details-card">
                <div class="detail-row">
                    <label>Client</label>
                    <div class="value">{{ selectedEvent.title }}</div>
                </div>
                <div class="detail-row">
                    <label>Time</label>
                    <div class="value">{{ selectedEvent.start | date:'EEEE, MMM d, h:mm a' }}</div>
                </div>
                <div class="detail-row">
                    <label>Topic</label>
                    <div class="topic-bubble">{{ selectedEvent.extendedProps?.topic }}</div>
                </div>
                <div class="detail-row" *ngIf="selectedEvent.extendedProps?.meetingLink">
                    <label>Virtual Room</label>
                    <div class="link-input">
                        <input type="text" [value]="selectedEvent.extendedProps?.meetingLink" readonly #lnk>
                        <button (click)="copyLink(lnk.value)"><i class="fas fa-copy"></i></button>
                    </div>
                </div>
                <div class="action-grid">
                    <button class="btn-primary" (click)="joinMeeting(selectedEvent.extendedProps?.roomId)">
                        <i class="fas fa-video"></i> Join Call
                    </button>
                    <button class="btn-danger" (click)="deleteMeeting(selectedEvent.id)">
                        <i class="fas fa-trash"></i> Cancel
                    </button>
                </div>
            </div>
        </div>
        <ng-template #noEvent>
            <div class="sidebar-section">
                <div class="section-title"><i class="fas fa-magic"></i> Quick Actions</div>
                <p class="hint-text">Select a time slot on the calendar to mark yourself as <b>Available</b> or click an event to manage it.</p>
                <div class="stats-mini">
                    <div class="s-card">
                        <div class="s-val">{{ meetingsCount }}</div>
                        <div class="s-lbl">Meetings</div>
                    </div>
                    <div class="s-card">
                        <div class="s-val">{{ availableSlotsCount }}</div>
                        <div class="s-lbl">Open Slots</div>
                    </div>
                </div>
            </div>
        </ng-template>

        <div class="sidebar-section">
            <div class="section-title"><i class="fas fa-clock"></i> Upcoming Today</div>
            <div class="upcoming-list">
                <div class="upcoming-item" *ngFor="let m of upcomingToday">
                    <div class="u-time">{{ m.time }}</div>
                    <div class="u-name">{{ m.name }}</div>
                </div>
                <div class="empty-state" *ngIf="!upcomingToday.length">No more meetings today.</div>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .calendar-page-container {
        display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem;
        height: calc(100vh - 120px); padding: 1rem;
    }
    
    .calendar-main {
        display: flex; flex-direction: column; padding: 1.5rem;
        border-radius: 20px; border: 1px solid var(--border-color);
        background: var(--bg-card); overflow: hidden;
    }

    .calendar-header-row {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 1.5rem;
    }
    .header-info h1 { font-size: 1.5rem; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.75rem; }
    .header-info h1 i { color: var(--primary); }
    .header-info p { color: var(--text-muted); font-size: 0.85rem; margin: 0.25rem 0 0; }

    .header-actions { display: flex; gap: 0.5rem; background: var(--bg-tertiary); padding: 4px; border-radius: 10px; }
    .view-btn {
        padding: 0.5rem 1rem; border: none; background: transparent; color: var(--text-muted);
        font-size: 0.8rem; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.2s;
    }
    .view-btn.active { background: var(--bg-card); color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

    .fc-native-container { flex: 1; min-height: 0; }

    .calendar-sidebar {
        display: flex; flex-direction: column; gap: 1.5rem;
        padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color);
        background: var(--bg-card); overflow-y: auto;
    }

    .section-title {
        font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
        color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem;
    }
    .section-title i { color: var(--primary); }

    .event-details-card {
        background: var(--bg-tertiary); padding: 1.25rem; border-radius: 15px;
        border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;
    }
    .detail-row label { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
    .detail-row .value { color: var(--text-primary); font-weight: 600; font-size: 0.95rem; }
    .topic-bubble { background: var(--bg-card); padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

    .link-input { display: flex; gap: 0.5rem; margin-top: 5px; }
    .link-input input { flex: 1; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem; font-size: 0.75rem; color: var(--primary); font-family: monospace; }
    .link-input button { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); padding: 0.5rem; cursor: pointer; }

    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; }
    .btn-danger { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); padding: 0.75rem; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; }

    .stats-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .s-card { background: var(--bg-tertiary); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); text-align: center; }
    .s-val { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    .s-lbl { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }

    .hint-text { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }

    .upcoming-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .upcoming-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 10px; border: 1px solid var(--border-color); }
    .u-time { font-size: 0.7rem; font-weight: 700; color: var(--primary); background: var(--primary-100); padding: 4px 8px; border-radius: 6px; }
    .u-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }

    .empty-state { text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 1rem; }

    :host ::ng-deep {
        .fc { --fc-border-color: var(--border-color); --fc-button-bg-color: var(--bg-tertiary); --fc-button-border-color: var(--border-color); --fc-button-hover-bg-color: var(--primary); --fc-button-active-bg-color: var(--primary); }
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--border-color); }
        .fc-col-header-cell { background: var(--bg-tertiary); padding: 10px 0; color: var(--text-secondary); font-weight: 600; font-size: 0.8rem; }
        .fc-timegrid-slot { height: 3.5rem; }
        .fc-toolbar { display: none !important; }
        .fc-event { border-radius: 8px !important; padding: 4px 8px !important; border: none !important; }
        .fc-v-event { background-color: var(--primary) !important; }
        .fc-bg-event { opacity: 0.15 !important; }
    }

    @media (max-width: 1024px) {
        .calendar-page-container { grid-template-columns: 1fr; height: auto; }
        .calendar-sidebar { height: auto; }
    }
  `]
})
export class AdminCalendarComponent implements OnInit, AfterViewInit {
    @ViewChild('calendarEl') calendarEl!: ElementRef;
    private calendarInstance: Calendar | null = null;

    meetingsCount = 0;
    availableSlotsCount = 0;
    upcomingToday: any[] = [];
    currentView = 'timeGridWeek';

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
        initialView: 'timeGridWeek',
        events: [],
        eventClick: this.handleEventClick.bind(this),
        select: this.handleSelect.bind(this),
        height: '100%',
        selectable: true,
        selectMirror: true,
        nowIndicator: true,
        dayMaxEvents: true,
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        allDaySlot: false,
    };

    selectedEvent: any = null;

    constructor(
        private api: ApiService, 
        private toast: ToastService,
        private socket: SocketService
    ) { }

    ngOnInit() {
        this.socket.calendarUpdates$.subscribe(() => {
            this.loadData();
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initCalendar(), 100);
    }

    initCalendar(): void {
        if (this.calendarEl && this.calendarEl.nativeElement) {
            this.calendarInstance = new Calendar(this.calendarEl.nativeElement, this.calendarOptions);
            this.calendarInstance.render();
            this.loadData();
        }
    }

    changeView(view: string) {
        if (this.calendarInstance) {
            this.calendarInstance.changeView(view);
            this.currentView = view;
        }
    }

    loadData() {
        this.api.getMeetings().subscribe({
            next: (meetingsRes) => {
                this.api.getAvailability().subscribe({
                    next: (availRes) => {
                        this.processEvents(meetingsRes.data, availRes.data);
                    }
                });
            },
            error: (err) => this.toast.error('Failed to load data', err.message)
        });
    }

    processEvents(meetings: any[], availability: any[]) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const meetingEvents: EventInput[] = meetings.map((m: any) => ({
            id: m.id,
            title: m.name,
            start: `${m.date}T${m.time.split(' - ')[0] || m.time}:00`,
            backgroundColor: this.getEventColor(m.status),
            extendedProps: { ...m, type: 'meeting', roomId: m.id, meetingLink: `${window.location.origin}/video-call/${m.id}` }
        }));

        const availEvents: EventInput[] = [];
        availability.forEach((day: any) => {
            day.slots.forEach((slot: string) => {
                const [start, end] = slot.split(' - ');
                availEvents.push({
                    title: 'Available',
                    start: `${day.date}T${start}:00`,
                    end: `${day.date}T${end}:00`,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981',
                    textColor: '#10b981',
                    display: 'background',
                    extendedProps: { type: 'availability' }
                });
            });
        });

        this.meetingsCount = meetings.length;
        this.availableSlotsCount = availEvents.length;
        this.upcomingToday = meetings
            .filter(m => m.date === todayStr)
            .map(m => ({ time: m.time.split(' - ')[0], name: m.name }))
            .sort((a, b) => a.time.localeCompare(b.time));

        if (this.calendarInstance) {
            this.calendarInstance.removeAllEvents();
            this.calendarInstance.addEventSource([...meetingEvents, ...availEvents]);
        }
    }

    getEventColor(status: string) {
        switch (status) {
            case 'scheduled': return '#3b82f6';
            case 'completed': return '#64748b';
            case 'cancelled': return '#f43f5e';
            default: return '#10b981';
        }
    }

    handleEventClick(arg: any) {
        if (arg.event.extendedProps.type === 'meeting') {
            this.selectedEvent = arg.event;
        } else {
            this.selectedEvent = null;
        }
    }

    handleSelect(arg: any) {
        if (arg.allDay) return;
        const date = arg.startStr.split('T')[0];
        const startTime = arg.startStr.split('T')[1].substring(0, 5);
        const endTime = arg.endStr.split('T')[1].substring(0, 5);
        const slotStr = `${startTime} - ${endTime}`;

        if (confirm(`Mark ${slotStr} on ${date} as Available?`)) {
            this.api.getAvailability().subscribe(res => {
                const existing = res.data.find((a: any) => a.date === date);
                const currentSlots = existing ? existing.slots : [];
                if (!currentSlots.includes(slotStr)) {
                    this.api.setAvailability(date, [...currentSlots, slotStr]).subscribe(() => {
                        this.loadData();
                        this.toast.success('Availability Saved', 'The slot has been added to your schedule.');
                    });
                }
            });
        }
        this.calendarInstance?.unselect();
    }

    copyLink(link: string) {
        navigator.clipboard.writeText(link);
        this.toast.success('Copied to clipboard', 'You can now share the meeting link.');
    }

    joinMeeting(roomId: string) {
        window.open(`/admin/dashboard/video-call?room=${roomId}`, '_blank');
    }

    deleteMeeting(id: string) {
        if (confirm('Delete this meeting?')) {
            // this.api.deleteMeeting(id).subscribe(() => this.loadData());
            const event = this.calendarInstance?.getEventById(id);
            event?.remove();
            this.selectedEvent = null;
        }
    }
}
