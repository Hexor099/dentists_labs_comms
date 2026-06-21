import { FolderNode } from "../types";

export const nextjsFolderStructure: FolderNode = {
  name: "dental-clinic-portal (Next.js Frontend)",
  type: "directory",
  description: "Next.js 14+ Client Portal incorporating clean, multi-tenant workspace routing, HIPAA asset safeguards, and mobile-ready responsive layouts.",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "app",
          type: "directory",
          description: "Next.js App router providing modular dashboard interfaces depending on auth claims.",
          children: [
            {
              name: "layout.tsx",
              type: "file",
              description: "Root entry shell applying global theme wrappers, Lucide providers, and state query clients.",
              fileContent: `export default function RootLayout({ children }) {
  return (
    <html lang="en" className="font-sans">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}`
            },
            {
              name: "page.tsx",
              type: "file",
              description: "Home portal router that redirects visitors to their respective dashboard dynamic segments based on role tags."
            },
            {
              name: "login",
              type: "directory",
              description: "Multi-tenant public login route mapping state controllers.",
              children: [
                { name: "page.tsx", type: "file", description: "Secure credential inputs with TOTP MFA support structures." }
              ]
            },
            {
              name: "(dashboards)",
              type: "directory",
              description: "Route groups executing role-specific navigation shell wrappers.",
              children: [
                {
                  name: "dentist",
                  type: "directory",
                  description: "Dashboard layout isolated for clinician controls. Technicians are never visible here.",
                  children: [
                    { name: "page.tsx", type: "file", description: "Clinician overview listing patient files and order status updates." },
                    { name: "cases", type: "directory", children: [{ name: "[id]", type: "directory", children: [{ name: "page.tsx", type: "file", description: "Single case full details, 3D Scan viewer hook, and invoices." }] }] }
                  ]
                },
                {
                  name: "technician",
                  type: "directory",
                  description: "Isolated queue layout. No billing metrics or doctor personal address tables are leaked here.",
                  children: [
                    { name: "page.tsx", type: "file", description: "Technician work tickets tracker, priority tags, and CAD checklist." }
                  ]
                },
                {
                  name: "admin",
                  type: "directory",
                  description: "Full workshop admin shell controls.",
                  children: [
                    { name: "page.tsx", type: "file", description: "Labor assignments, dentist customer lists, invoice ledger, and shipping." }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "components",
          type: "directory",
          description: "Reusable modular atomic ui elements styled via Tailwind.",
          children: [
            { name: "ui", type: "directory", description: "Base atomic controls (cards, tables, buttons, select menus)." },
            { name: "scan-viewer.tsx", type: "file", description: "Interactive WebGL/Three.js CAD scanner rendering STL/PLY dental scans." }
          ]
        },
        {
          name: "lib",
          type: "directory",
          description: "Utility wrappers, axios/fetch configuration, JWT decoder, encryption helper.",
          children: [
            { name: "api.ts", type: "file" },
            { name: "helpers.ts", type: "file" }
          ]
        },
        {
          name: "store",
          type: "directory",
          description: "Zustand global clients caching role contexts and UI state triggers."
        }
      ]
    },
    {
      name: "package.json",
      type: "file",
      description: "Frontend dependencies (React-Query, Axios, Three.js, Lucide-react, Tailwind)."
    }
  ]
};

export const nestjsFolderStructure: FolderNode = {
  name: "dental-lab-backend (NestJS Backend API)",
  type: "directory",
  description: "NestJS Domain-driven structure delivering secured modular boundaries, Role guards, and database transactions.",
  children: [
    {
      name: "src",
      type: "directory",
      children: [
        {
          name: "app.module.ts",
          type: "file",
          description: "Bootstraps TypeOrm/Drizzle modules, Redis cache drivers, and feature module declarations.",
          fileContent: `@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({ store: redisStore, host: 'localhost', port: 6379 }),
    AuthModule,
    LabModule,
    CaseModule,
    InvoiceModule,
    DeliveryModule,
  ],
})
export class AppModule {}`
        },
        {
          name: "common",
          type: "directory",
          description: "Shared global interceptors, custom filters, and permission guards.",
          children: [
            {
              name: "guards",
              type: "directory",
              children: [
                {
                  name: "roles.guard.ts",
                  type: "file",
                  description: "NestJS Role verification guard. Compares active context token payload elements against handler metadata.",
                  fileContent: `@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Appended by JwtStrategy
    
    return requiredRoles.includes(user.role);
  }
}`
                }
              ]
            },
            {
              name: "interceptors",
              type: "directory",
              description: "Security logging, timing interceptors, and dentist payload serializers (filtering out internal notes/tech assignments)."
            }
          ]
        },
        {
          name: "modules",
          type: "directory",
          description: "Domain contexts with clear separation of business rules and APIs.",
          children: [
            {
              name: "case",
              type: "directory",
              description: "Handles case processing, dentists submissions, order numbers, and HIPAA files.",
              children: [
                { name: "case.controller.ts", type: "file", description: "REST end-points mapping cases." },
                { name: "case.service.ts", type: "file", description: "Business processes (order flow assertions, due limits checking)." },
                { name: "case.entity.ts", type: "file", description: "TypeORM database entity mapping Cases." },
                { name: "dto", type: "directory", children: [{ name: "create-case.dto.ts", type: "file" }] }
              ]
            },
            {
              name: "invoice",
              type: "directory",
              description: "Integrates financial balance systems, prices structures, and Stripe gateway proxies.",
              children: [
                { name: "invoice.controller.ts", type: "file" },
                { name: "invoice.service.ts", type: "file" }
              ]
            },
            {
              name: "delivery",
              type: "directory",
              description: "Logistics integrations (FedEx/UPS webhooks and routing).",
              children: [
                { name: "delivery.service.ts", type: "file" }
              ]
            }
          ]
        },
        {
          name: "db",
          type: "directory",
          description: "Database configurations, drizzle.config, knex migrations, or db seeders.",
          children: [
            { name: "schema.ts", type: "file", description: "Centralized relational database schemas." },
            { name: "migrations", type: "directory" }
          ]
        }
      ]
    },
    {
      name: "nest-cli.json",
      type: "file"
    },
    {
      name: "tsconfig.json",
      type: "file"
    }
  ]
};
