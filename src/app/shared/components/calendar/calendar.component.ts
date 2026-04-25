import { Component, Input, Output, EventEmitter, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, MeetingData } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CookieService } from '../../../core/services/cookie.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingModalComponent } from '../modals/booking-modal/booking-modal.component';
import { AvailabilityModalComponent } from '../modals/availability-modal/availability-modal.component';
import { MatButtonModule } from '@angular/material/button';

interface TimeSlot {
    time: string;
    available: boolean;
    checking: boolean;
}

import { Calendar } from '@fullcalendar/core';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { SocketService } from '../../../core/services/socket.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, AfterViewInit {
    @Input() isVisible = false;
    @Output() closed = new EventEmitter<void>();

    @ViewChild('calendarEl') calendarEl!: ElementRef;
    private calendarInstance: Calendar | null = null;

    isAdmin = false;
    selectedDate: Date | null = null;
    isSubmitting = false;

    // Store availability map for easy lookup
    private availabilityMap: Record<string, string[]> = {};

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        slotMinTime: '08:00:00',
        slotMaxTime: '18:00:00',
        allDaySlot: false,
        height: '100%',
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        events: []
    };

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private toast: ToastService,
        private socket: SocketService,
        private notificationService: NotificationService,
        private cookieService: CookieService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.checkAdmin();
        this.fetchAvailability();
        this.socket.calendarUpdates$.subscribe(() => this.fetchAvailability());
    }

    private checkAdmin() {
        const token = this.cookieService.get('admin_token');
        this.isAdmin = !!token;
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initCalendar(), 100);
    }

    initCalendar(): void {
        if (this.calendarEl && this.calendarEl.nativeElement) {
            this.calendarInstance = new Calendar(this.calendarEl.nativeElement, this.calendarOptions);
            this.calendarInstance.render();
        }
    }

    fetchAvailability(): void {
        this.api.getPublicMeetings().subscribe(meetingsRes => {
            this.api.getAvailability().subscribe(availRes => {
                // Map availability for faster lookup
                this.availabilityMap = {};
                availRes.data.forEach((day: any) => {
                    this.availabilityMap[day.date] = day.slots;
                });

                const meetingEvents = meetingsRes.data.map((m: any) => ({
                    title: 'Booked',
                    start: `${m.date}T${m.time.split(' - ')[0] || m.time}:00`,
                    color: '#f43f5e',
                    display: 'block',
                    extendedProps: { type: 'meeting' }
                }));

                const availEvents: any[] = [];
                availRes.data.forEach((day: any) => {
                    day.slots.forEach((slot: string) => {
                        const [start, end] = slot.split(' - ');
                        availEvents.push({
                            title: 'Available',
                            start: `${day.date}T${start}:00`,
                            end: `${day.date}T${end}:00`,
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            borderColor: '#38bdf8',
                            textColor: '#38bdf8',
                            display: 'background',
                            extendedProps: { type: 'availability' }
                        });
                    });
                });

                if (this.calendarInstance) {
                    this.calendarInstance.removeAllEvents();
                    this.calendarInstance.addEventSource([...meetingEvents, ...availEvents]);
                }
            });
        });
    }

    handleDateSelect(selectInfo: DateSelectArg) {
        const dateStr = selectInfo.startStr.split('T')[0];
        
        if (this.isAdmin) {
            this.openAvailabilityManager(dateStr);
            this.calendarInstance?.unselect();
            return;
        }

        if (selectInfo.allDay) {
            this.toast.error('Invalid Selection', 'Please select a specific time slot.');
            return;
        }

        const events = this.calendarInstance?.getEvents() || [];
        const isAvailable = events.some(e => 
            e.display === 'background' && 
            e.start! <= selectInfo.start && 
            e.end! >= selectInfo.end
        );

        if (!isAvailable) {
            this.toast.error('Not Available', 'Please select a time slot marked as Available.');
            this.calendarInstance?.unselect();
            return;
        }

        const isBooked = events.some(e => 
            e.display === 'block' && 
            ((e.start! >= selectInfo.start && e.start! < selectInfo.end) || 
             (e.end! > selectInfo.start && e.end! <= selectInfo.end))
        );

        if (isBooked) {
            this.toast.error('Slot Taken', 'This time slot is already booked.');
            this.calendarInstance?.unselect();
            return;
        }

        this.openBookingModal(selectInfo);
    }

    private openBookingModal(selectInfo: DateSelectArg) {
        const startTime = selectInfo.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = selectInfo.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const timeStr = `${startTime} - ${endTime}`;
        const dateStr = selectInfo.startStr.split('T')[0];

        const dialogRef = this.dialog.open(BookingModalComponent, {
            width: '600px',
            data: { date: selectInfo.start, dateStr, timeStr },
            panelClass: 'glass-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.fetchAvailability();
                this.close();
            }
            this.calendarInstance?.unselect();
        });
    }

    private openAvailabilityManager(date: string) {
        const existingSlots = this.availabilityMap[date] || [];
        const dialogRef = this.dialog.open(AvailabilityModalComponent, {
            width: '500px',
            data: { date, existingSlots },
            panelClass: 'glass-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) this.fetchAvailability();
        });
    }

    handleEventClick(clickInfo: EventClickArg) {
        this.toast.error('Slot Taken', 'This time slot is already booked. Please select an empty slot.');
    }

    close(): void {
        this.closed.emit();
        this.calendarInstance?.unselect();
    }

    reset(): void {
        this.selectedDate = null;
        this.calendarInstance?.unselect();
    }
}
