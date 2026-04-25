import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../services/admin-api.service';
import { ThemeService } from '../../core/services/theme.service';
import { CooldownService } from '../../core/services/cooldown.service';
import { CookieService } from '../../core/services/cookie.service';

interface FlowNode {
  id: string;
  label: string;
  icon: string;
  type: 'frontend' | 'backend' | 'database' | 'auth' | 'service';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  details: string[];
}

interface FlowConnection {
  from: string;
  to: string;
  label: string;
  method?: string;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  // Login form state
  username = '';
  password = '';
  showPass = false;
  error = '';
  loading = false;

  // 2FA state
  show2FA = false;
  tfaCode = '';
  tfaError = '';
  tfaLoading = false;
  resending = false;

  // Flow diagram state
  animationActive = true;
  svgViewBox = '0 0 1400 900';
  flowNodes: FlowNode[] = [];
  flowConnections: FlowConnection[] = [];
  visibleConnections: FlowConnection[] = [];
  draggingNode: FlowNode | null = null;
  dragOffset = { x: 0, y: 0 };
  particles: Particle[] = [];
  animationFrameId: number | null = null;

  // Fullscreen viewer state
  showFullscreenViewer = false;
  viewerZoom = 1;
  viewerPanX = 0;
  viewerPanY = 0;
  isViewerDragging = false;
  viewerDragStart = { x: 0, y: 0 };
  viewerPanStart = { x: 0, y: 0 };

  @ViewChild('tfaInput') tfaInput!: ElementRef;
  @ViewChild('fullscreenViewer') fullscreenViewer!: ElementRef;

  constructor(
    private api: AdminApiService,
    private router: Router,
    public themeService: ThemeService,
    private cooldown: CooldownService,
    private cookieService: CookieService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // Check for existing valid token
    const token = this.cookieService.get('admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
          return;
        }
      } catch {}
      this.cookieService.delete('admin_auth');
      this.cookieService.delete('admin_token');
    }

    this.initializeFlowDiagram();
  }

  ngAfterViewInit(): void {
    this.startAmbientAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // ═══════════════════════════════════════════
  // FLOW DIAGRAM INITIALIZATION
  // ═══════════════════════════════════════════

  private initializeFlowDiagram(): void {
    // Define the full-stack architecture nodes
    this.flowNodes = [
      {
        id: 'user',
        label: 'User Browser',
        icon: '\uf0ac',
        type: 'frontend',
        x: 50,
        y: 50,
        width: 160,
        height: 85,
        color: '#667eea',
        details: ['Angular 17 Frontend', 'Port: 4200', '7 Themes']
      },
      {
        id: 'login',
        label: 'Login Portal',
        icon: '\uf023',
        type: 'auth',
        x: 50,
        y: 200,
        width: 160,
        height: 85,
        color: '#fa709a',
        details: ['2FA Authentication', 'JWT Tokens', 'Rate Limiting']
      },
      {
        id: 'proxy',
        label: 'Proxy Server',
        icon: '\uf0ac',
        type: 'service',
        x: 300,
        y: 125,
        width: 140,
        height: 70,
        color: '#30cfd0',
        details: ['proxy.conf.json', 'Dev: localhost:4200']
      },
      {
        id: 'express',
        label: 'Express.js Server',
        icon: '\uf269',
        type: 'backend',
        x: 500,
        y: 100,
        width: 180,
        height: 85,
        color: '#f093fb',
        details: ['Node.js + Express', 'Port: 3000', 'Helmet + CORS']
      },
      {
        id: 'auth-api',
        label: 'Auth Endpoints',
        icon: '\uf084',
        type: 'auth',
        x: 750,
        y: 50,
        width: 160,
        height: 85,
        color: '#fa709a',
        details: ['POST /api/auth/login', 'POST /api/auth/verify-2fa', 'JWT Generation']
      },
      {
        id: 'middleware',
        label: 'Middleware Stack',
        icon: '\uf023',
        type: 'service',
        x: 750,
        y: 200,
        width: 160,
        height: 85,
        color: '#30cfd0',
        details: ['Rate Limiter', 'Joi Validation', 'Winston Logger']
      },
      {
        id: 'firebase',
        label: 'Firebase DB',
        icon: '\uf1c0',
        type: 'database',
        x: 1000,
        y: 100,
        width: 160,
        height: 85,
        color: '#4facfe',
        details: ['Firestore', 'Contacts & Hires', 'Analytics Data']
      },
      {
        id: 'email',
        label: 'Email Service',
        icon: '\uf0e0',
        type: 'service',
        x: 1000,
        y: 250,
        width: 160,
        height: 85,
        color: '#30cfd0',
        details: ['Nodemailer', '2FA OTP Delivery', 'HTML Templates']
      },
      {
        id: 'admin',
        label: 'Admin Dashboard',
        icon: '\uf015',
        type: 'frontend',
        x: 50,
        y: 400,
        width: 160,
        height: 85,
        color: '#667eea',
        details: ['CRUD Operations', 'Analytics View', 'Theme Manager']
      },
      {
        id: 'contact',
        label: 'Contact Forms',
        icon: '\uf003',
        type: 'service',
        x: 300,
        y: 350,
        width: 140,
        height: 70,
        color: '#30cfd0',
        details: ['POST /api/contact', 'Daily IP Limit', 'Email Notifications']
      },
      {
        id: 'hire',
        label: 'Hire Requests',
        icon: '\uf0b1',
        type: 'service',
        x: 500,
        y: 350,
        width: 140,
        height: 90,
        color: '#30cfd0',
        details: ['POST /api/hire', 'Firestore Storage', 'Admin CRUD']
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '\uf080',
        type: 'service',
        x: 750,
        y: 350,
        width: 160,
        height: 85,
        color: '#30cfd0',
        details: ['Real-time Tracking', 'Heartbeat 30s', 'Live Visitors']
      },
      {
        id: 'rtdb',
        label: 'Realtime DB',
        icon: '\uf1c0',
        type: 'database',
        x: 1000,
        y: 450,
        width: 160,
        height: 85,
        color: '#4facfe',
        details: ['Firebase RTDB', 'Presence System', 'Live Sync']
      },
      {
        id: 'cv',
        label: 'CV Service',
        icon: '\uf15b',
        type: 'service',
        x: 300,
        y: 550,
        width: 140,
        height: 70,
        color: '#30cfd0',
        details: ['SSE Streaming', 'Base64 Progress', 'PDF Download']
      },
      {
        id: 'portfolio',
        label: 'Portfolio SPA',
        icon: '\uf0ac',
        type: 'frontend',
        x: 50,
        y: 650,
        width: 160,
        height: 85,
        color: '#667eea',
        details: ['10 Sections', 'GSAP + Three.js', 'Responsive Design']
      }
    ];

    // Define connections between nodes
    this.flowConnections = [
      { from: 'user', to: 'login', label: 'Navigation', color: '#667eea' },
      { from: 'login', to: 'proxy', label: 'API Calls', color: '#667eea' },
      { from: 'proxy', to: 'express', label: 'Forward', method: 'HTTP', color: '#30cfd0' },
      { from: 'express', to: 'auth-api', label: 'Route', color: '#f093fb' },
      { from: 'express', to: 'middleware', label: 'Process', color: '#f093fb' },
      { from: 'auth-api', to: 'firebase', label: 'Store Session', color: '#fa709a' },
      { from: 'auth-api', to: 'email', label: 'Send OTP', color: '#fa709a' },
      { from: 'express', to: 'contact', label: 'Contact API', color: '#f093fb' },
      { from: 'express', to: 'hire', label: 'Hire API', color: '#f093fb' },
      { from: 'express', to: 'analytics', label: 'Tracking', color: '#f093fb' },
      { from: 'contact', to: 'firebase', label: 'Save Data', color: '#30cfd0' },
      { from: 'hire', to: 'firebase', label: 'Save Data', color: '#30cfd0' },
      { from: 'analytics', to: 'rtdb', label: 'Live Data', color: '#30cfd0' },
      { from: 'user', to: 'portfolio', label: 'Browse', color: '#667eea' },
      { from: 'portfolio', to: 'contact', label: 'Submit Form', color: '#667eea' },
      { from: 'portfolio', to: 'hire', label: 'Submit Request', color: '#667eea' },
      { from: 'portfolio', to: 'cv', label: 'Download CV', color: '#667eea' },
      { from: 'user', to: 'admin', label: 'After Auth', color: '#667eea' },
      { from: 'admin', to: 'express', label: 'CRUD + Stats', method: 'JWT', color: '#667eea' }
    ];

    this.visibleConnections = [...this.flowConnections];

    // Generate floating particles
    this.particles = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    }));
  }

  // ═══════════════════════════════════════════
  // DRAG AND DROP FUNCTIONALITY
  // ═══════════════════════════════════════════

  startDrag(event: MouseEvent, node: FlowNode): void {
    event.preventDefault();
    this.draggingNode = node;
    const svg = this.el.nativeElement.querySelector('.flow-svg') as SVGSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgP = pt.matrixTransform(ctm.inverse());
    this.dragOffset.x = svgP.x - node.x;
    this.dragOffset.y = svgP.y - node.y;
  }

  onDrag(event: MouseEvent): void {
    if (!this.draggingNode) return;
    const svg = this.el.nativeElement.querySelector('.flow-svg') as SVGSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgP = pt.matrixTransform(ctm.inverse());
    this.draggingNode.x = Math.max(0, Math.min(1400 - this.draggingNode.width, svgP.x - this.dragOffset.x));
    this.draggingNode.y = Math.max(0, Math.min(900 - this.draggingNode.height, svgP.y - this.dragOffset.y));
  }

  endDrag(): void {
    this.draggingNode = null;
  }

  startDragTouch(event: TouchEvent, node: FlowNode): void {
    event.preventDefault();
    this.draggingNode = node;
    const touch = event.touches[0];
    const svg = this.el.nativeElement.querySelector('.flow-svg') as SVGSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgP = pt.matrixTransform(ctm.inverse());
    this.dragOffset.x = svgP.x - node.x;
    this.dragOffset.y = svgP.y - node.y;
  }

  onDragTouch(event: TouchEvent): void {
    if (!this.draggingNode) return;
    const touch = event.touches[0];
    const svg = this.el.nativeElement.querySelector('.flow-svg') as SVGSVGElement;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgP = pt.matrixTransform(ctm.inverse());
    this.draggingNode.x = Math.max(0, Math.min(1400 - this.draggingNode.width, svgP.x - this.dragOffset.x));
    this.draggingNode.y = Math.max(0, Math.min(900 - this.draggingNode.height, svgP.y - this.dragOffset.y));
  }

  // ═══════════════════════════════════════════
  // SVG HELPERS
  // ═══════════════════════════════════════════

  getGradientUrl(type: string): string {
    // Return direct gradient reference for SVG
    const gradientMap: { [key: string]: string } = {
      'frontend': 'url(#gradFrontend)',
      'backend': 'url(#gradBackend)',
      'database': 'url(#gradDatabase)',
      'auth': 'url(#gradAuth)',
      'service': 'url(#gradService)'
    };
    return gradientMap[type] || 'url(#gradFrontend)';
  }

  getGradientUrlFS(type: string): string {
    // Return direct gradient reference for fullscreen SVG
    const gradientMap: { [key: string]: string } = {
      'frontend': 'url(#gradFrontendFS)',
      'backend': 'url(#gradBackendFS)',
      'database': 'url(#gradDatabaseFS)',
      'auth': 'url(#gradAuthFS)',
      'service': 'url(#gradServiceFS)'
    };
    return gradientMap[type] || 'url(#gradFrontendFS)';
  }

  getConnectionPath(conn: FlowConnection): string {
    const fromNode = this.flowNodes.find(n => n.id === conn.from);
    const toNode = this.flowNodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    const x1 = fromNode.x + fromNode.width / 2;
    const y1 = fromNode.y + fromNode.height / 2;
    const x2 = toNode.x + toNode.width / 2;
    const y2 = toNode.y + toNode.height / 2;

    // Create smooth bezier curve
    const dx = Math.abs(x2 - x1) * 0.4;
    const dy = Math.abs(y2 - y1) * 0.4;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  getParticleDuration(conn: FlowConnection): string {
    const fromNode = this.flowNodes.find(n => n.id === conn.from);
    const toNode = this.flowNodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '3s';
    
    const distance = Math.sqrt(
      Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
    );
    return `${Math.max(2, distance / 150)}s`;
  }

  getNodeIcon(node: FlowNode): string {
    return node.icon;
  }

  getNodeDelay(node: FlowNode): string {
    return `${(node.x + node.y) / 200}s`;
  }

  // ═══════════════════════════════════════════
  // AMBIENT ANIMATION
  // ═══════════════════════════════════════════

  private startAmbientAnimation(): void {
    const animate = () => {
      // Subtle floating animation for nodes
      const time = Date.now() / 1000;
      this.flowNodes.forEach((node, i) => {
        const baseX = node.x;
        const floatY = Math.sin(time * 0.5 + i * 0.3) * 3;
        // We don't modify the actual y to keep drag positions stable
      });
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  // ═══════════════════════════════════════════
  // AUTHENTICATION METHODS
  // ═══════════════════════════════════════════

  async login() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password.';
      return;
    }
    this.loading = true;
    try {
      const response = await this.api.login(this.username, this.password).toPromise();
      if (response?.success && response.requires2FA) {
        this.show2FA = true;
        this.tfaCode = '';
        this.tfaError = '';
        setTimeout(() => this.tfaInput?.nativeElement?.focus(), 100);
      } else if (response?.success && response.token) {
        this.cookieService.set('admin_auth', 'true', 1);
        this.cookieService.set('admin_token', response.token, 1);
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error = response?.message || 'Login failed.';
      }
    } catch (err: any) {
      const status = err?.status ?? err?.error?.status;
      if (status === 429) {
        const retryAfter = err?.headers?.get('retry-after');
        const ms = retryAfter ? parseInt(retryAfter, 10) * 1000 : 900000;
        this.cooldown.activate(ms, err?.error?.message || 'Too many login attempts. Please wait.');
      } else {
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async submitTfa() {
    this.tfaError = '';
    if (this.tfaCode.length !== 6 || !/^\d+$/.test(this.tfaCode)) {
      this.tfaError = 'Please enter a valid 6-digit code.';
      return;
    }
    this.tfaLoading = true;
    try {
      const response = await this.api.verify2FA(this.tfaCode).toPromise();
      if (response?.success && response.token) {
        this.cookieService.set('admin_auth', 'true', 1);
        this.cookieService.set('admin_token', response.token, 1);
        this.show2FA = false;
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.tfaError = response?.message || 'Invalid code. Please try again.';
      }
    } catch (err: any) {
      this.tfaError = err.error?.message || 'Verification failed. Please try again.';
    } finally {
      this.tfaLoading = false;
    }
  }

  async resendCode() {
    this.resending = true;
    this.tfaError = '';
    try {
      await this.api.resend2FA().toPromise();
      this.tfaCode = '';
    } catch (err: any) {
      this.tfaError = err.error?.message || 'Failed to resend code. Please try again.';
    } finally {
      this.resending = false;
    }
  }

  cancelTfa() {
    this.show2FA = false;
    this.tfaCode = '';
    this.tfaError = '';
  }

  // ═══════════════════════════════════════════
  // FULLSCREEN ARCHITECTURE VIEWER
  // ═══════════════════════════════════════════

  openFullscreenViewer(): void {
    this.showFullscreenViewer = true;
    this.viewerZoom = 1;
    this.viewerPanX = 0;
    this.viewerPanY = 0;
    document.body.style.overflow = 'hidden';
  }

  closeFullscreenViewer(): void {
    this.showFullscreenViewer = false;
    document.body.style.overflow = '';
  }

  zoomIn(): void {
    this.viewerZoom = Math.min(this.viewerZoom + 0.2, 3);
  }

  zoomOut(): void {
    this.viewerZoom = Math.max(this.viewerZoom - 0.2, 0.3);
  }

  resetView(): void {
    this.viewerZoom = 1;
    this.viewerPanX = 0;
    this.viewerPanY = 0;
  }

  onViewerWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.viewerZoom = Math.max(0.3, Math.min(this.viewerZoom + delta, 3));
  }

  onViewerMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isViewerDragging = true;
      this.viewerDragStart = { x: event.clientX, y: event.clientY };
      this.viewerPanStart = { x: this.viewerPanX, y: this.viewerPanY };
    }
  }

  onViewerMouseMove(event: MouseEvent): void {
    if (this.isViewerDragging) {
      const dx = event.clientX - this.viewerDragStart.x;
      const dy = event.clientY - this.viewerDragStart.y;
      this.viewerPanX = this.viewerPanStart.x + dx;
      this.viewerPanY = this.viewerPanStart.y + dy;
    }
  }

  onViewerMouseUp(): void {
    this.isViewerDragging = false;
  }

  getViewerTransform(): string {
    return `translate(${this.viewerPanX}px, ${this.viewerPanY}px) scale(${this.viewerZoom})`;
  }

  getConnectionLabelX(conn: FlowConnection): number {
    const fromNode = this.flowNodes.find(n => n.id === conn.from);
    if (!fromNode) return 0;
    return fromNode.x + fromNode.width / 2;
  }

  getConnectionLabelY(conn: FlowConnection): number {
    const fromNode = this.flowNodes.find(n => n.id === conn.from);
    if (!fromNode) return 0;
    return fromNode.y + fromNode.height / 2 - 10;
  }

  getConnectionLabel(conn: FlowConnection): string {
    return conn.method ? `${conn.label} (${conn.method})` : conn.label;
  }
}
