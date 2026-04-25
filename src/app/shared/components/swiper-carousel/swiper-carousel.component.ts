import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ContentChild, TemplateRef, PLATFORM_ID, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, FreeMode, Autoplay } from 'swiper/modules';

@Component({
  selector: 'app-swiper-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swiper-carousel.component.html',
  styleUrls: ['./swiper-carousel.component.scss']
})
export class SwiperCarouselComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() items: any[] = [];
  @Input() slidesPerView: number | 'auto' = 3;
  @Input() spaceBetween: number = 24;
  @Input() showNavigation: boolean | 'auto' = 'auto';
  @Input() showPagination: boolean = true;
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = false; // Disabled by default for Angular interaction safety
  @Input() rows: number = 1;
  @Input() breakpoints: any = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    768: { slidesPerView: 2, spaceBetween: 24 },
    1024: { slidesPerView: 3, spaceBetween: 24 },
    1280: { slidesPerView: 4, spaceBetween: 24 }
  };
  @Input() slideClass: string = '';

  @ContentChild('slideTemplate', { static: false }) slideTemplate!: TemplateRef<any>;
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  private swiperInstance?: Swiper;
  private isBrowser: boolean;
  public navigationEnabled: boolean = false;
  public id: string = Math.random().toString(36).substring(2, 9);
  public isHovered: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get groupedItems(): any[][] {
    if (this.rows <= 1) return this.items.map(item => [item]);
    const result = [];
    for (let i = 0; i < this.items.length; i += this.rows) {
      result.push(this.items.slice(i, i + this.rows));
    }
    return result;
  }

  ngOnInit(): void {
    this.updateNavigationState();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser && this.items && this.items.length > 0) {
      this.initSwiper();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].isFirstChange()) {
      this.updateNavigationState();
      
      if (this.swiperInstance) {
        setTimeout(() => {
          this.swiperInstance?.update();
        });
      } else if (this.isBrowser && this.items && this.items.length > 0 && this.swiperContainer) {
        this.initSwiper();
      }
    }
  }

  private updateNavigationState(): void {
    const shouldShow = this.showNavigation === 'auto' 
      ? this.items.length > (typeof this.slidesPerView === 'number' ? this.slidesPerView : 1)
      : this.showNavigation;
    
    if (this.navigationEnabled !== shouldShow) {
      this.navigationEnabled = shouldShow;
      this.cdr.detectChanges();
    }
  }

  private initSwiper(): void {
    if (!this.swiperContainer) return;
    this.updateNavigationState();

    const modules = [FreeMode];
    if (this.navigationEnabled) modules.push(Navigation);
    if (this.showPagination) modules.push(Pagination);
    if (this.autoplay) modules.push(Autoplay);

    this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
      modules: modules,
      slidesPerView: this.slidesPerView,
      spaceBetween: this.spaceBetween,
      freeMode: false,
      loop: this.loop,
      grabCursor: true,
      observer: true,
      observeParents: true,
      breakpoints: this.breakpoints,
      navigation: this.navigationEnabled ? {
        nextEl: '.next-' + this.id,
        prevEl: '.prev-' + this.id,
      } : false,
      pagination: this.showPagination ? {
        el: '.pagination-' + this.id,
        clickable: true,
      } : false,
      autoplay: this.autoplay ? {
        delay: 5000,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      } : false,
    });
  }

  ngOnDestroy(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = undefined;
    }
  }
}
