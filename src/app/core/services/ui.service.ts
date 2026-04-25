import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techs: string[];
  detailTitle: string;
  detailDescription: string;
  projectFlow: string[];
  features: string[];
  howItWorks: string;
  methodsUsed: string[];
  strengths: string[];
  techStack: { name: string }[];
  images: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  image: string;
  excerpt: string;
  readTime: string;
  content: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private isBrowser: boolean;

  // Modal state
  private projectModalOpen = new BehaviorSubject<boolean>(false);
  private blogModalOpen = new BehaviorSubject<boolean>(false);
  private hireMeModalOpen = new BehaviorSubject<boolean>(false);
  private projectPreviewOpen = new BehaviorSubject<boolean>(false);
  private mobileMenuOpen = new BehaviorSubject<boolean>(false);
  private upworkPopupOpen = new BehaviorSubject<boolean>(false);
  private portfolioSidebarOpen = new BehaviorSubject<boolean>(false);
  private calendarModalOpen = new BehaviorSubject<boolean>(false);

  // Selected project/blog for modal display
  private selectedProject = new BehaviorSubject<Project | null>(null);
  private selectedBlogPost = new BehaviorSubject<BlogPost | null>(null);
  private selectedPreviewProject = new BehaviorSubject<Project | null>(null);

  // Hire form state
  private selectedServices = new BehaviorSubject<string[]>([]);

  projectModalOpen$ = this.projectModalOpen.asObservable();
  blogModalOpen$ = this.blogModalOpen.asObservable();
  hireMeModalOpen$ = this.hireMeModalOpen.asObservable();
  projectPreviewOpen$ = this.projectPreviewOpen.asObservable();
  mobileMenuOpen$ = this.mobileMenuOpen.asObservable();
  upworkPopupOpen$ = this.upworkPopupOpen.asObservable();
  portfolioSidebarOpen$ = this.portfolioSidebarOpen.asObservable();
  calendarModalOpen$ = this.calendarModalOpen.asObservable();
  selectedProject$ = this.selectedProject.asObservable();
  selectedBlogPost$ = this.selectedBlogPost.asObservable();
  selectedPreviewProject$ = this.selectedPreviewProject.asObservable();
  selectedServices$ = this.selectedServices.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Project Modal
   */
  openProjectModal(project: Project): void {
    this.selectedProject.next(project);
    this.projectModalOpen.next(true);
    this.preventBodyScroll();
  }

  closeProjectModal(): void {
    this.projectModalOpen.next(false);
    this.allowBodyScroll();
  }

  /**
   * Blog Modal
   */
  openBlogModal(post: BlogPost): void {
    this.selectedBlogPost.next(post);
    this.blogModalOpen.next(true);
    this.preventBodyScroll();
  }

  closeBlogModal(): void {
    this.blogModalOpen.next(false);
    this.allowBodyScroll();
  }

  /**
   * Hire Me Modal
   */
  openHireMeModal(): void {
    this.hireMeModalOpen.next(true);
    this.preventBodyScroll();
  }

  closeHireMeModal(): void {
    this.hireMeModalOpen.next(false);
    this.selectedServices.next([]);
    this.allowBodyScroll();
  }

  /**
   * Project Preview (Full-screen)
   */
  openProjectPreview(project: Project): void {
    this.selectedPreviewProject.next(project);
    this.projectPreviewOpen.next(true);
    this.preventBodyScroll();
  }

  closeProjectPreview(): void {
    this.projectPreviewOpen.next(false);
    this.allowBodyScroll();
  }

  /**
   * Mobile Menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.next(!this.mobileMenuOpen.value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.next(false);
  }

  /**
   * Upwork Popup
   */
  toggleUpworkPopup(): void {
    this.upworkPopupOpen.next(!this.upworkPopupOpen.value);
  }

  closeUpworkPopup(): void {
    this.upworkPopupOpen.next(false);
  }

  openPortfolioSidebar(): void {
    this.portfolioSidebarOpen.next(true);
    this.preventBodyScroll();
  }

  closePortfolioSidebar(): void {
    this.portfolioSidebarOpen.next(false);
    this.allowBodyScroll();
  }

  /**
   * Calendar Modal
   */
  openCalendarModal(): void {
    this.calendarModalOpen.next(true);
    this.preventBodyScroll();
  }

  closeCalendarModal(): void {
    this.calendarModalOpen.next(false);
    this.allowBodyScroll();
  }

  /**
   * Selected Services (Hire Me)
   */
  toggleService(service: string): void {
    const current = this.selectedServices.value;
    if (current.includes(service)) {
      this.selectedServices.next(current.filter(s => s !== service));
    } else {
      this.selectedServices.next([...current, service]);
    }
  }

  getSelectedServices(): string[] {
    return this.selectedServices.value;
  }

  /**
   * Prevent/allow body scroll for modals
   */
  private preventBodyScroll(): void {
    if (this.isBrowser) {
      document.body.classList.add('modal-open');
    }
  }

  private allowBodyScroll(): void {
    if (this.isBrowser) {
      // Only allow scroll if no modals are open
      const anyModalOpen = [
        this.projectModalOpen.value,
        this.blogModalOpen.value,
        this.hireMeModalOpen.value,
        this.projectPreviewOpen.value,
        this.calendarModalOpen.value
      ].some(open => open);

      if (!anyModalOpen) {
        document.body.classList.remove('modal-open');
      }
    }
  }
}
