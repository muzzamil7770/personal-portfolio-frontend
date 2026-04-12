import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, NgZone, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Section {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-scroll-3d-demo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './scroll-3d-demo.component.html',
  styleUrls: ['./scroll-3d-demo.component.scss']
})
export class Scroll3dDemoComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wrapper', { static: true }) wrapperRef!: ElementRef<HTMLDivElement>;

  readonly sections: Section[] = [
    {
      title: 'The Beginning',
      subtitle: 'Section 01',
      description: 'Every great journey starts with a single step. Watch as the geometry awakens from stillness.',
      accent: '#6c63ff'
    },
    {
      title: 'Transformation',
      subtitle: 'Section 02',
      description: 'Form shifts and evolves. Rigid edges dissolve into fluid motion as perspective changes.',
      accent: '#ff6584'
    },
    {
      title: 'Expansion',
      subtitle: 'Section 03',
      description: 'Growth is inevitable. The structure expands outward, reaching into new dimensions.',
      accent: '#43e97b'
    },
    {
      title: 'Convergence',
      subtitle: 'Section 04',
      description: 'All paths lead to a singular point. Complexity collapses into elegant simplicity.',
      accent: '#f7971e'
    },
    {
      title: 'Transcendence',
      subtitle: 'Section 05',
      description: 'Beyond form, beyond motion — pure energy. The final state of infinite possibility.',
      accent: '#4facfe'
    }
  ];

  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mainMesh!: THREE.Mesh;
  private wireframeMesh!: THREE.Mesh;
  private particles!: THREE.Points;
  private clock = new THREE.Clock();
  private rafId = 0;

  // Mouse
  private mouse = new THREE.Vector2();
  private targetMouse = new THREE.Vector2();

  // Bound handlers
  private resizeHandler!: () => void;
  private mouseMoveHandler!: (e: MouseEvent) => void;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initThree();
    this.buildScrollTimeline();
    this.startLoop();
    this.bindEvents();
  }

  // ─── Three.js Setup ──────────────────────────────────────────────────────────

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    this.scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0x6c63ff, 3, 20);
    pointLight1.position.set(-4, 2, 3);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6584, 3, 20);
    pointLight2.position.set(4, -2, 3);
    this.scene.add(pointLight2);

    // Main geometry — icosahedron
    const geo = new THREE.IcosahedronGeometry(1.4, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x6c63ff,
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1
    });
    this.mainMesh = new THREE.Mesh(geo, mat);
    this.mainMesh.castShadow = true;
    this.mainMesh.receiveShadow = true;
    this.scene.add(this.mainMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    this.wireframeMesh = new THREE.Mesh(geo, wireMat);
    this.wireframeMesh.scale.setScalar(1.01);
    this.scene.add(this.wireframeMesh);

    // Particle field
    this.particles = this.buildParticles();
    this.scene.add(this.particles);
  }

  private buildParticles(): THREE.Points {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 30;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    });
    return new THREE.Points(geo, mat);
  }

  // ─── GSAP ScrollTrigger Timeline ─────────────────────────────────────────────

  private buildScrollTimeline(): void {
    const mesh = this.mainMesh;
    const wire = this.wireframeMesh;
    const cam  = this.camera;
    const mat  = mesh.material as THREE.MeshStandardMaterial;

    // Colour stops per section transition
    const colorStops = [
      new THREE.Color(0x6c63ff),
      new THREE.Color(0xff6584),
      new THREE.Color(0x43e97b),
      new THREE.Color(0xf7971e),
      new THREE.Color(0x4facfe)
    ];

    // Proxy object for colour lerp driven by GSAP
    const colorProxy = { t: 0 };
    const fromColor  = new THREE.Color();
    const toColor    = new THREE.Color();

    const stConfig = {
      trigger: this.wrapperRef.nativeElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2
    };

    const tl = gsap.timeline({ scrollTrigger: stConfig });

    // Section 1 → 2
    tl.to(mesh.rotation, { x: Math.PI * 0.5, y: Math.PI, duration: 1 }, 0)
      .to(mesh.position, { x: 2.5, y: -0.5, duration: 1 }, 0)
      .to(cam.position,  { z: 6, duration: 1 }, 0);

    // Section 2 → 3
    tl.to(mesh.rotation, { x: Math.PI, y: Math.PI * 2, duration: 1 }, 1)
      .to(mesh.position, { x: -2.5, y: 0.5, duration: 1 }, 1)
      .to(mesh.scale,    { x: 1.4, y: 1.4, z: 1.4, duration: 1 }, 1)
      .to(cam.position,  { z: 5.5, duration: 1 }, 1);

    // Section 3 → 4
    tl.to(mesh.rotation, { x: Math.PI * 1.5, y: Math.PI * 3, duration: 1 }, 2)
      .to(mesh.position, { x: 0, y: -1, duration: 1 }, 2)
      .to(mesh.scale,    { x: 0.8, y: 0.8, z: 0.8, duration: 1 }, 2)
      .to(cam.position,  { z: 4.5, duration: 1 }, 2);

    // Section 4 → 5
    tl.to(mesh.rotation, { x: Math.PI * 2, y: Math.PI * 4, duration: 1 }, 3)
      .to(mesh.position, { x: 0, y: 0, duration: 1 }, 3)
      .to(mesh.scale,    { x: 1.2, y: 1.2, z: 1.2, duration: 1 }, 3)
      .to(cam.position,  { z: 5, duration: 1 }, 3);

    // Colour animation via lerp proxy (avoids GSAP/THREE.Color type conflict)
    gsap.to(colorProxy, {
      t: colorStops.length - 1,
      ease: 'none',
      scrollTrigger: stConfig,
      onUpdate: () => {
        const idx   = Math.min(Math.floor(colorProxy.t), colorStops.length - 2);
        const alpha = colorProxy.t - idx;
        fromColor.copy(colorStops[idx]);
        toColor.copy(colorStops[idx + 1]);
        mat.color.copy(fromColor.lerp(toColor, alpha));
      }
    });

    // Wireframe parallax
    gsap.to(wire.rotation, {
      scrollTrigger: { ...stConfig, scrub: 1.8 },
      x: Math.PI * 2,
      y: Math.PI * 4,
      z: Math.PI
    });

    // Particle parallax
    gsap.to(this.particles.rotation, {
      scrollTrigger: { ...stConfig, scrub: 3 },
      y: Math.PI * 0.5
    });
  }

  // ─── Render Loop ─────────────────────────────────────────────────────────────

  private startLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const tick = () => {
        this.rafId = requestAnimationFrame(tick);
        const t = this.clock.getElapsedTime();

        // Idle float
        this.mainMesh.position.y += Math.sin(t * 0.8) * 0.0015;
        this.wireframeMesh.rotation.y = this.mainMesh.rotation.y;
        this.wireframeMesh.rotation.x = this.mainMesh.rotation.x;
        this.wireframeMesh.position.copy(this.mainMesh.position);
        this.wireframeMesh.scale.copy(this.mainMesh.scale).multiplyScalar(1.01);

        // Smooth mouse parallax
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        this.camera.position.x += (this.mouse.x * 0.8 - this.camera.position.x) * 0.03;
        this.camera.position.y += (-this.mouse.y * 0.8 - this.camera.position.y) * 0.03;
        this.camera.lookAt(this.mainMesh.position);

        this.renderer.render(this.scene, this.camera);
      };
      tick();
    });
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  private bindEvents(): void {
    this.resizeHandler = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    cancelAnimationFrame(this.rafId);
    ScrollTrigger.getAll().forEach(t => t.kill());

    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);

    this.renderer.dispose();
    this.scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}
