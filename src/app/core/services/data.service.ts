import { Injectable } from '@angular/core';

export interface NavItem {
  label: string;
  href: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  grade: string;
  period: string;
  description: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export interface TechStack {
  name: string;
}

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
  techStack: TechStack[];
  images: string[];
}

export interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
  colorFrom: string;
  colorTo: string;
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

export interface ContactInfo {
  email: string;
  whatsapp: string;
  whatsappLink: string;
  linkedin: string;
  linkedinUrl: string;
}

export interface FooterInfo {
  name: string;
  description: string;
  github: string;
  linkedin: string;
  whatsapp: string;
  email: string;
}

export interface SiteData {
  nav: {
    name: string;
    links: NavItem[];
    hireMe: { label: string; href: string; };
  };
  hero: {
    greeting: string;
    firstName: string;
    lastName: string;
    typedStrings: string[];
    description: string;
    email: string;
    whatsapp: string;
    linkedin: string;
    profileImage: string;
  };
  about: {
    title: string;
    description1: string;
    description2: string;
    stats: { value: string; label: string; }[];
    profileImage: string;
  };
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  blog: BlogPost[];
  contact: ContactInfo;
  footer: FooterInfo;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private readonly siteData: SiteData = {
    nav: {
      name: "Muhammad Muzzamil",
      links: [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
        { label: "Experience", href: "#experience" },
        { label: "Services", href: "#services" },
        { label: "Projects", href: "#projects" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Blog", href: "#blog" },
        { label: "Contact", href: "#contact" }
      ],
      hireMe: { label: "Hire Me", href: "#hire" }
    },

    hero: {
      greeting: "Hello, I'm",
      firstName: "Muhammad",
      lastName: "Muzzamil",
      typedStrings: [
        "Software Engineer",
        "Angular Developer",
        "Full-Stack Web Developer",
        "Healthcare Systems Specialist",
        "Performance Optimizer"
      ],
      description: "Dedicated Software Engineer with 2+ years of experience specializing in Angular-based front-end development for scalable web applications, particularly in healthcare systems. Building high-performance, user-centric dashboards and enterprise-grade platforms.",
      email: "mohammadmuzzamil7770@gmail.com",
      whatsapp: "+923068667770",
      linkedin: "mohammadmuzzamil7770",
      profileImage: "assets/MUZZAMIL.png"
    },

    about: {
      title: "Software Engineer & Angular Developer",
      description1: "I'm Muhammad Muzzamil, a dedicated Software Engineer with 2+ years of experience specializing in Angular-based front-end development for scalable web applications, particularly in healthcare systems. Currently working as an Angular Developer at Anchors Tech, building high-performance, user-centric dashboards and enterprise-grade platforms.",
      description2: "My strong expertise spans TypeScript, modern UI architecture, REST API integration, with a focus on performance optimization, clean code, and seamless user experience. I'm experienced in integrating third-party services including Stripe, Firebase, and authentication systems.",
      stats: [
        { value: "20+", label: "Projects Completed" },
        { value: "2+", label: "Years Experience" },
        { value: "Healthcare", label: "Domain Expertise" },
        { value: "90%+", label: "Lighthouse Scores" }
      ],
      profileImage: "assets/MUZZAMIL.png"
    },

    skills: [
      { name: "HTML/CSS", level: 100 },
      { name: "JavaScript", level: 90 },
      { name: "React", level: 85 },
      { name: "Angular", level: 95 },
      { name: "Tailwind CSS", level: 85 },
      { name: "Bootstrap", level: 95 }
    ],

    experience: [
      {
        title: "Angular Developer",
        company: "Anchors Tech",
        location: "Johar Town, Lahore, Punjab, Pakistan",
        period: "Jul 2024 - Present",
        description: "Developed a healthcare management dashboard with appointment scheduling, patient records, multi-location booking, and insurance integration using Angular 19. Built real estate platforms with Figma-to-code conversion, interactive Mapbox maps, multi-step forms, and dynamic PDF generation. Implemented reusable components, Angular Material UI, JWT authentication, Firebase integration, and real-time notifications with Socket.io. Optimized application performance, achieving 90%+ Lighthouse scores and integrated AI chatbots with n8n automation workflows."
      },
      {
        title: "Angular Developer (3-month Internship)",
        company: "Anchors Tech",
        location: "Johar Town, Lahore, Punjab, Pakistan",
        period: "Mar 2024 - Jul 2024",
        description: "Developed responsive web applications using Angular, TypeScript, and Bootstrap with a focus on clean architecture and reusable components. Converted Figma wireframes into pixel-perfect UIs and integrated REST APIs for dynamic data handling. Collaborated in Agile workflows, performed unit testing, and used Git/GitHub for version control."
      },
      {
        title: "Front-End Developer",
        company: "AlphaNuix Technologies",
        location: "Layyah, Punjab, Pakistan",
        period: "Mar 2023 - Jul 2024",
        description: "Developed responsive web applications using React and TypeScript, focusing on modern UI patterns. Built reusable components and integrated REST APIs for seamless data flow. Collaborated with backend teams (PHP/MySQL) to deliver full-stack features. Performed debugging, testing, and cross-browser optimization."
      }
    ],

    education: [
      {
        degree: "Bachelor of Science in Information Technology (BS IT)",
        institution: "Government College University Faisalabad (GCUF)",
        grade: "CGPA: 3.4",
        period: "Sep 2020 - Sep 2024",
        description: "Comprehensive study in web development, software engineering, and modern programming paradigms. Specialized in frontend technologies, database management, and system design. Graduated with strong foundation in both theoretical concepts and practical application development, with focus on Angular, React, and full-stack development."
      }
    ],

    services: [
      {
        icon: "fas fa-code",
        title: "Responsive Web Development",
        description: "Creating fully responsive websites using HTML5, CSS3, and modern frameworks like Bootstrap and Tailwind CSS for optimal display across all devices and screen sizes."
      },
      {
        icon: "fab fa-react",
        title: "React & Angular Development",
        description: "Building dynamic single-page applications using React.js and Angular with component-based architecture, efficient state management, and seamless user experiences."
      },
      {
        icon: "fas fa-database",
        title: "API & Firebase Integration",
        description: "Integrating RESTful APIs and Firebase services including Authentication, Firestore, and Hosting to enhance app functionality and deliver real-time experiences."
      },
      {
        icon: "fas fa-paint-brush",
        title: "UI/UX Design Implementation",
        description: "Transforming design mockups into pixel-perfect, interactive interfaces that prioritize usability, accessibility, and visual appeal across all platforms."
      },
      {
        icon: "fas fa-rocket",
        title: "Performance Optimization",
        description: "Enhancing website performance through code optimization, lazy loading, image compression, and implementing SEO best practices for better search rankings."
      },
      {
        icon: "fab fa-git-alt",
        title: "Version Control & Collaboration",
        description: "Efficient code management using Git and GitHub for seamless collaboration, version tracking, and continuous integration workflows in team environments."
      }
    ],

    projects: [
      {
        id: "project1",
        title: "Stepping Stone Therapy | Pathways EHR",
        description: "Full-featured medical practice management system with clinician availability, appointment scheduling, patient records, multi-location booking, insurance integration, and real-time notifications.",
        image: "assets/Stepping Stone Therapy (Case Study Design) n.png",
        techs: ["Angular 19", "TypeScript", "Firebase", "Socket.io"],
        detailTitle: "Stepping Stone Therapy – Pathways EHR",
        detailDescription: "An enterprise-grade healthcare practice management platform designed for mental health and therapy practices. Built with Angular 19, featuring appointment scheduling, claims management, clinical notes, billing, and real-time notifications across six distinct user roles.",
        projectFlow: [
          "User logs in → Role detection (Provider, Biller, Scheduler, Director, Patient)",
          "Dashboard loads with role-specific KPIs and metrics",
          "Appointment scheduling with real-time availability checking",
          "Clinical documentation with 15+ pre-assessment form categories",
          "Insurance claims submission and tracking pipeline",
          "Real-time notifications via Firebase for instant updates"
        ],
        features: [
          "Full calendar view with drag-and-drop appointment scheduling",
          "Appointment lifecycle management (requested → pending → completed/cancelled)",
          "Clinical notes creation with template-based documentation",
          "Insurance claim submission and tracking with status pipeline",
          "Patient onboarding workflows with comprehensive profiles",
          "Real-time notifications via Firebase Realtime Database",
          "Role-based access control with 6 distinct user roles",
          "PDF generation for invoices and clinical reports",
          "Practice metrics dashboard with Chart.js visualizations",
          "Multi-location support with room-based booking",
          "Automated appointment reminder service",
          "Payment integration with Authorize.Net tokenization"
        ],
        howItWorks: "The platform uses Angular 19's standalone components with lazy-loaded routes for each user role. Data flows through a centralized service layer (BaseService) that handles all HTTP requests with automatic JWT token injection. Real-time updates are managed through Firebase listeners that push notifications to relevant users. The appointment system follows a state machine pattern, tracking each appointment through its lifecycle from request to completion.",
        methodsUsed: [
          "Angular 19 Standalone Components with Signals for reactive state",
          "RxJS BehaviorSubjects for multi-component state synchronization",
          "Lazy Loading with route-level code splitting",
          "Firebase Realtime Database for instant push notifications",
          "JWT Authentication with role-based route guards",
          "Smart/Dumb Component Pattern for clean architecture",
          "Custom HTTP Interceptor for automatic token management",
          "Chart.js and ECharts for data visualization",
          "jsPDF and html2pdf for document generation",
          "Reactive Forms with comprehensive validation"
        ],
        strengths: [
          "Complex role-based architecture with 6 distinct user portals",
          "Real-time notification system handling 1000+ concurrent users",
          "HIPAA-compliant data handling and secure payment processing",
          "Scalable service layer with 45+ feature-specific services",
          "Advanced appointment scheduling with conflict detection",
          "Comprehensive clinical documentation system",
          "Automated billing workflows with late cancellation fees",
          "Cross-tab synchronization for multi-device support"
        ],
        techStack: [
          { name: "Angular 19" },
          { name: "TypeScript" },
          { name: "RxJS" },
          { name: "Firebase" },
          { name: "Angular Material" },
          { name: "Chart.js" },
          { name: "jsPDF" },
          { name: "Authorize.Net" }
        ],
        images: [
          "assets/projects/stepping_stone/1.png",
          "assets/projects/stepping_stone/2.png",
          "assets/projects/stepping_stone/3.png",
          "assets/projects/stepping_stone/4.png",
          "assets/projects/stepping_stone/5.png",
          "assets/projects/stepping_stone/6.png",
          "assets/projects/stepping_stone/7.png",
          "assets/projects/stepping_stone/8.png"
        ]
      },
      {
        id: "project2",
        title: "FirstCall | TeleHealth EHR",
        description: "Multi-role healthcare platform with patient management, appointments, encounters, analytics modules, role-based access control, and secure authentication with custom guards and interceptors.",
        image: "assets/Telemedix.png",
        techs: ["Angular 21", "TypeScript", "Signals", "SVG Charts"],
        detailTitle: "FirstCall Telehealth Portal – Occupational Health",
        detailDescription: "A real-time occupational telehealth platform for skilled nursing facilities. Connects injured employees with occupational medicine providers via telehealth within minutes — replacing costly ER visits with efficient telehealth consultations.",
        projectFlow: [
          "Employee reports injury → Multi-step wizard (injury type → triage → provider)",
          "System matches with available occupational medicine provider",
          "Video visit initiated with live provider notes",
          "Treatment plan created with medications and follow-up",
          "Return-to-work tracking with status updates",
          "Employer dashboard monitors all incidents and compliance"
        ],
        features: [
          "Real-time incident reporting with multi-step injury wizard",
          "Telehealth video visit simulation with live notes",
          "OSHA 300A compliance tracking and recordable rates",
          "Custom SVG animated charts (bar charts, sparklines, progress rings)",
          "Employer dashboard with KPI stats and cost comparison",
          "Employee portal with treatment tracking and medication management",
          "SweetAlert2 themed confirmations matching brand palette",
          "CSV export functionality for incident data",
          "PDF report generation with custom templates",
          "Responsive design with mobile-first grid layouts",
          "Role-based access (Employer, Employee, Provider)",
          "Animated loading states and skeleton screens"
        ],
        howItWorks: "Built with Angular 21 using the latest features including signals for reactive state management, standalone components, and new control flow syntax. The application uses a DTO-to-Domain-Model mapping layer to decouple API responses from UI components. All data is managed through Angular Signals for automatic reactivity. Custom SVG components provide animated charts without external dependencies.",
        methodsUsed: [
          "Angular 21 with Signals (signal(), computed()) for state",
          "Standalone Components with lazy loading",
          "Custom SVG Charts with CSS animations",
          "Angular HttpClient with firstValueFrom for async operations",
          "Route Guards (canActivate, canMatch) for role protection",
          "SweetAlert2 custom theming for branded dialogs",
          "SCSS with CSS Custom Properties for design tokens",
          "json-server for mock REST API with full CRUD",
          "Angular Material Dialogs for complex forms",
          "Responsive mobile-first CSS Grid layouts"
        ],
        strengths: [
          "Zero external charting library dependency - pure SVG charts",
          "Complete role-based access control with guard system",
          "Two-layer data model (DTO → Domain) for clean architecture",
          "Signal-based reactivity for instant UI updates",
          "Custom design system with consistent theming",
          "Full CRUD operations with optimistic UI updates",
          "Accessible forms with comprehensive validation",
          "Performance-optimized with OnPush change detection"
        ],
        techStack: [
          { name: "Angular 21" },
          { name: "TypeScript" },
          { name: "Angular Signals" },
          { name: "SCSS" },
          { name: "SweetAlert2" },
          { name: "Angular Material" },
          { name: "json-server" }
        ],
        images: [
          "assets/projects/firstcall/1.png",
          "assets/projects/firstcall/2.png",
          "assets/projects/firstcall/3.png",
          "assets/projects/firstcall/4.png",
          "assets/projects/firstcall/5.png",
          "assets/projects/firstcall/6.png",
          "assets/projects/firstcall/7.png"
        ]
      },
      {
        id: "project3",
        title: "SNF Wound Care – EMR & Telemedicine",
        description: "HIPAA-compliant EMR platform serving 12,000+ patients across 178 skilled nursing facilities with video consultation, wound image tracking, and PCC/MatrixCare EMR integration.",
        image: "assets/SNF Wound Care (Case Study Design).png",
        techs: ["React", "Laravel", "MySQL", "HIPAA"],
        detailTitle: "SNF Wound Care – EMR & Telemedicine Platform",
        detailDescription: "A HIPAA-compliant Electronic Medical Records platform serving 12,000+ patients across 178 skilled nursing facilities. Features video consultation, wound image tracking, clinical documentation, and integration with PCC/MatrixCare EMR systems.",
        projectFlow: [
          "Clinician logs in → Dashboard shows assigned patients and visits",
          "Visit initiated with patient selection and history review",
          "Wound assessment with image capture and annotation",
          "Treatment plan creation with medication orders",
          "Documentation submitted to EMR (PCC/MatrixCare)",
          "Billing codes generated for insurance submission"
        ],
        features: [
          "HIPAA-compliant patient data management and encryption",
          "Video consultation integration for telemedicine visits",
          "Wound image capture with annotation and tracking",
          "Clinical documentation templates for wound care",
          "PCC/MatrixCare EMR integration for data sync",
          "Multi-facility support across 178 skilled nursing facilities",
          "Patient scheduling and visit management",
          "Billing code generation and insurance submission",
          "Analytics dashboard for clinical outcomes tracking",
          "Mobile-responsive design for on-the-go documentation",
          "Role-based access for clinicians, nurses, and administrators",
          "Audit logging for compliance tracking"
        ],
        howItWorks: "The platform uses React for a responsive frontend with component-based architecture, communicating with a Laravel backend via RESTful APIs. Patient data is encrypted at rest and in transit to meet HIPAA requirements. Wound images are stored securely with metadata for tracking healing progress over time. Integration with PCC/MatrixCare EMR systems allows seamless data exchange between platforms.",
        methodsUsed: [
          "React with functional components and hooks",
          "Laravel RESTful API with JWT authentication",
          "MySQL database with encrypted patient records",
          "HIPAA-compliant data encryption (AES-256)",
          "RESTful API design with versioning",
          "React Router for client-side navigation",
          "Formik + Yup for form validation",
          "Axios with interceptors for API calls",
          "React Query for server state management",
          "Responsive CSS Grid and Flexbox layouts"
        ],
        strengths: [
          "HIPAA compliance with end-to-end encryption",
          "Serving 12,000+ patients across 178 facilities",
          "Complex EMR integration with PCC/MatrixCare",
          "Wound image tracking with annotation tools",
          "Scalable multi-tenant architecture",
          "Real-time data synchronization across facilities",
          "Comprehensive audit logging for compliance",
          "Mobile-optimized for point-of-care documentation"
        ],
        techStack: [
          { name: "React" },
          { name: "Laravel" },
          { name: "MySQL" },
          { name: "HIPAA Compliance" },
          { name: "JWT Auth" },
          { name: "REST API" },
          { name: "React Query" }
        ],
        images: [
          "assets/SNF Wound Care (Case Study Design).png"
        ]
      }
    ],

    testimonials: [
      {
        quote: "Mohammad delivered exceptional work with clean, fast, and responsive design. His attention to detail and professional approach exceeded our expectations.",
        initials: "SW",
        name: "Sarah Williams",
        role: "Healthcare Director",
        colorFrom: "#3b82f6",
        colorTo: "#8b5cf6"
      },
      {
        quote: "Outstanding design sense and lightning-fast delivery. Mohammad's technical expertise and communication skills make him a pleasure to work with.",
        initials: "DK",
        name: "David Kim",
        role: "Tech Startup CEO",
        colorFrom: "#22c55e",
        colorTo: "#3b82f6"
      },
      {
        quote: "Reliable, skilled, and professional. The website turned out perfect and our user engagement has increased significantly since the launch.",
        initials: "PN",
        name: "Priya Nair",
        role: "E-commerce Manager",
        colorFrom: "#a855f7",
        colorTo: "#ec4899"
      }
    ],

    blog: [
      {
        id: "blog-post1",
        title: "Tailwind CSS: Build Fast & Clean UIs in 2025",
        date: "August 1, 2025",
        category: "Tutorial",
        categoryColor: "bg-blue-500",
        image: "assets/pngwing.com.png",
        excerpt: "Discover why Tailwind CSS remains the fastest way to build responsive, maintainable user interfaces with modern development practices.",
        readTime: "5 min read",
        content: [
          "Tailwind CSS continues to revolutionize how developers approach styling in 2025. Its utility-first methodology has proven to be not just a trend, but a fundamental shift in how we think about CSS architecture and maintainability.",
          "### Why Tailwind Still Dominates",
          "The utility-first approach reduces custom CSS bloat and keeps your codebase clean and predictable. With Tailwind, you're writing less custom CSS and more semantic, reusable utility classes that scale beautifully across large applications.",
          "### Best Practices for 2025",
          "Combine Tailwind with modern frameworks like React or Angular to build scalable component libraries. Use PostCSS plugins and PurgeCSS to keep build sizes minimal while maintaining design consistency across your entire application.",
          "If you're prioritizing development speed, design consistency, and long-term maintainability—Tailwind CSS remains the unmatched choice for modern web development."
        ]
      },
      {
        id: "blog-post2",
        title: "React or Angular in 2025? A Developer's Guide",
        date: "July 15, 2025",
        category: "Comparison",
        categoryColor: "bg-purple-500",
        image: "assets/angular-react.png",
        excerpt: "A comprehensive comparison to help developers choose the right frontend framework for their next project based on real-world scenarios.",
        readTime: "8 min read",
        content: [
          "The eternal debate continues: React or Angular? In 2025, both frameworks have evolved significantly, each offering unique advantages for different project requirements and team dynamics.",
          "### React: Flexibility and Ecosystem",
          "React's strength lies in its flexibility and massive ecosystem. With its component-based architecture and virtual DOM, React excels in rapid prototyping, startup environments, and projects requiring custom solutions. The learning curve is gentler, making it ideal for teams transitioning to modern frameworks.",
          "### Angular: Structure and Enterprise Features",
          "Angular provides a complete toolkit with built-in features like routing, forms, HTTP client, and dependency injection. It's perfect for large-scale enterprise applications where structure, type safety, and comprehensive tooling are priorities.",
          "### Making the Right Choice",
          "Choose React if you value flexibility, want a gentler learning curve, or are building a startup MVP. Choose Angular if you need structure, type safety, and comprehensive tooling out of the box for large-scale applications."
        ]
      }
    ],

    contact: {
      email: "mohammadmuzzamil7770@gmail.com",
      whatsapp: "+92 306 8667770",
      whatsappLink: "923068667770",
      linkedin: "muzzamil-dev",
      linkedinUrl: "muzzamil-dev"
    },

    footer: {
      name: "Muhammad Muzzamil",
      description: "Software Engineer & Angular Developer specializing in modern web technologies, healthcare systems, and enterprise-grade applications.",
      github: "muzzamil7770",
      linkedin: "mohammadmuzzamil7770/",
      whatsapp: "923068667770",
      email: "mohammadmuzzamil7770@gmail.com"
    }
  };

  getData(): SiteData {
    return this.siteData;
  }
}
