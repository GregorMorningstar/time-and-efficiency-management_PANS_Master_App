import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { MonitorCog, Folder,LayoutGrid, BookOpen, Factory, Calendar,MessagesSquare, BrainCog, LogOut,  Cog   } from 'lucide-react';
import AppLogo from './app-logo';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { machine } from 'os';
const LazyBarcode = React.lazy(() => import('react-barcode'));
export function AppSidebar() {
    interface User {
        name?: string;
        role?: 'admin' | 'moderator' | 'employee';
        barcode?: string;
    }

    interface PageProps {
        auth?: {
            user?: User;
            barcode?: string;
        };
        // add other props if needed
        [key: string]: unknown;
    }

    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    // detect collapsed state by observing wrapper width
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                // when sidebar becomes narrow (icon-only) — adjust threshold if needed
                setIsSidebarCollapsed(w < 96);
            }
        });
        ro.observe(el);
        // initial
        setIsSidebarCollapsed(el.getBoundingClientRect().width < 96);
        return () => ro.disconnect();
    }, []);

    // Menu dla moderatora
    const moderatorNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'produkcja',
              href: '/dashboard/moderator/production',
            icon: Factory,
        },
        {
            title: 'Szczegóły maszyn',
            href: '/dashboard/moderator/machines',
            icon: BrainCog,
        },
        {
            title: 'planowanie',
            href: '/dashboard/moderator/planning',
            icon: Calendar,
        },
        {
            title: 'wydziały',
            href: '/dashboard/moderator/departments',
            icon: BookOpen,
        },
        {
            title: 'pracownicy',
            href: '/dashboard/moderator/employees',
            icon: Folder,
        },
    ];

    // Menu dla administratora
    const adminNavItems = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Użytkownicy',
            href: '/admin/users',
            icon: Folder,
        },
        {
            title: 'Raporty',
            href: '/admin/reports',
            icon: BookOpen,
        },

    ];

    // Menu dla pracownika
    const employeeNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Moje dane',
            href: '/profile',
            icon: Folder,
        },
        {
            title: 'Moje maszyny',
            href: '/employee/machines',
            icon: Cog ,
        },
    ];

    // Wspólne menu dla wszystkich zalogowanych
  const commonNavItems =
        user?.role === 'moderator'
            ? []
            : [

                 {
                     title: 'Chat',
                     href: '/chat',
                     icon: MessagesSquare ,
                 },

                 {
                     title: 'Awarie',
                     href: '#',
                     icon: MonitorCog,
                 },

             ];

    // menu na podstawie roli
    let mainNavItems = employeeNavItems;
    if (user?.role === 'moderator') mainNavItems = moderatorNavItems;
    else if (user?.role === 'admin') mainNavItems = adminNavItems;

    // wspólne menu na początek
    mainNavItems = [...commonNavItems, ...mainNavItems];

    return (
<div
  ref={wrapperRef}
>
            <Sidebar collapsible="icon" variant="inset" className="backdrop-blur bg-white/10 text-black ">
                <SidebarFooter>
                    {/* barcode shown only when sidebar is expanded */}
                    {user?.barcode && !isSidebarCollapsed && (
                        <div className="w-full px-3 pt-3">
                            <div className="w-full flex justify-center rounded bg-white/5 p-2" style={{ minHeight: '5vh' }}>
                                <Suspense fallback={<div className="text-xs text-muted-foreground">Ładowanie…</div>}>
                                    <LazyBarcode
                                        value={user.barcode}
                                        displayValue={false}
                                        height={50}
                                        margin={0}
                                        background="white"
                                        lineColor="#000"
                                    />
                                </Suspense>
                            </div>
                            <div className="mt-1 text-center text-[11px] font-mono tracking-widest text-muted-foreground">
                                {user.barcode}
                            </div>
                        </div>
                    )}

                    <SidebarMenu
                     className="
    border-b
    border-emerald-700
    shadow-lg
    shadow-emerald-500/40
    transition-all
    duration-500
    hover:shadow-emerald-700/70
    hover:border-emerald-500
   mr-8
  ">
                        {user ? (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton size="lg" disabled className="cursor-default !opacity-100 flex flex-col items-start text-center gap-2">
                                        {user.role && !isSidebarCollapsed && <span className="text-bold text-muted-foreground">{user.name}</span>}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                {/* Wyloguj - czerwony przycisk; pokazuje "W" gdy sidebar jest zminimalizowany */}
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href="/logout" method="post" className="text-left text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2">
                                            <LogOut />
                                            {!isSidebarCollapsed && <span>Wyloguj</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        ) : (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={typeof route === 'function' ? (route as any)('login') : '/login'} className="text-left">
                                            Zaloguj
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link href={typeof route === 'function' ? (route as any)('register') : '/register'} className="text-left">
                                            Rejestracja
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarContent
                    className="
    border-b
    border-emerald-700
    shadow-lg
    shadow-emerald-500/40
    transition-all
    duration-500
    hover:shadow-emerald-700/70
    hover:border-emerald-500

  "
                >
                        <NavMain items={mainNavItems} className="backdrop-blur bg-white/10 text-black back-ground-gray-400"/>

                </SidebarContent>
            </Sidebar>
        </div>
     );
 }
