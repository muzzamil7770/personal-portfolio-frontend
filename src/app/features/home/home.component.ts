import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService, SiteData } from '../../core/services/data.service';
import { UiService } from '../../core/services/ui.service';
import { ApiService, ContactFormData } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { CvViewerComponent } from '../cv-viewer/cv-viewer.component';
import { AiChatbotComponent } from '../../shared/components/ai-chatbot/ai-chatbot.component';
import { MeetingRequestComponent } from '../../shared/components/meeting-request/meeting-request.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CvViewerComponent, AiChatbotComponent, MeetingRequestComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  siteData: SiteData;
  contactForm: FormGroup;
  isBrowser: boolean;
  isSubmitting = false;
  showCvViewer = false;
  showMeetingRequest = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataService: DataService,
    public uiService: UiService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private toast: ToastService,
    private notificationService: NotificationService
  ) {
    this.siteData = this.dataService.getData();
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeTypedEffect();
      this.initializeScrollEffects();
      this.animateSkillBars();
    }
  }

  private initializeTypedEffect(): void {
    const strings = this.siteData.hero.typedStrings;
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedElement = document.getElementById('typed');

    if (!typedElement) return;

    const type = () => {
      const currentString = strings[index];

      if (isDeleting) {
        typedElement.textContent = currentString.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedElement.textContent = currentString.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 40 : 60;

      if (!isDeleting && charIndex === currentString.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        index = (index + 1) % strings.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };

    type();
  }

  private initializeScrollEffects(): void {
    if (!this.isBrowser) return;

    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
      window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.width = scrolled + '%';
      }, { passive: true });
    }
  }

  private animateSkillBars(): void {
    if (!this.isBrowser) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skillFills = entry.target.querySelectorAll('.skill-fill');
          skillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            (fill as HTMLElement).style.width = width + '%';
          });
        }
      });
    }, { threshold: 0.3 });

    const skillsSection = document.getElementById('skills-content');
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  }

  openProjectModal(projectId: string): void {
    const project = this.siteData.projects.find(p => p.id === projectId);
    if (project) {
      this.uiService.openProjectModal(project);
    }
  }

  openProjectPreview(projectId: string): void {
    const project = this.siteData.projects.find(p => p.id === projectId);
    if (project) {
      this.uiService.openProjectPreview(project);
    }
  }

  openBlogModal(blogId: string): void {
    const post = this.siteData.blog.find(p => p.id === blogId);
    if (post) {
      this.uiService.openBlogModal(post);
    }
  }

  isContactInvalid(field: string): boolean {
    const ctrl = this.contactForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submitContactForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toast.error('Invalid Form', 'Please fill in all required fields correctly.');
      this.notificationService.addNotification(
        'Form Validation Error', 
        'Contact form submission failed due to invalid inputs.', 
        'fas fa-exclamation-triangle', 
        'system', 
        'warning'
      );
      return;
    }

    this.isSubmitting = true;
    const formData: ContactFormData = this.contactForm.value;

    this.apiService.submitContactForm(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.contactForm.reset();
        this.toast.success(
          'Message Sent!',
          "Thanks for reaching out. I'll get back to you within 24 hours."
        );
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toast.error('Failed to Send', err.message || 'Server error');
        this.notificationService.addNotification(
          'Message Failed', 
          `Contact message to "${formData.subject}" failed: ${err.message || 'Server error'}`, 
          'fas fa-times-circle', 
          'contact', 
          'error'
        );
      }
    });
  }

  openCvViewer(): void {
    this.showCvViewer = true;
  }

  openPortfolioSidebar(): void {
    this.uiService.openPortfolioSidebar();
  }

  onCvViewerClosed(): void {
    this.showCvViewer = false;
  }

  openCalendarModal(): void {
    this.uiService.openCalendarModal();
  }

  onMeetingRequestSubmitted(requestData: any): void {
    // Here you would typically send the request to your backend
    console.log('Meeting request submitted:', requestData);

    // For now, we'll just show a success message
    // In a real implementation, you'd send this to your server
    this.notificationService.addNotification(
      'Meeting Request Sent',
      `Meeting request from ${requestData.name} has been sent successfully.`,
      'fas fa-video',
      'meeting',
      'success'
    );
  }
}
