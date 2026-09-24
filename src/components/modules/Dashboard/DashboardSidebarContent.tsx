"use client"

import { ScrollArea } from '@/components/ui/scroll-area';
import { getIconComponent } from '@/src/lib/iconMapper';
import { NavSection } from '@/src/types/dashboard.types';
import { UserInfo } from '@/src/types/user.types';
import { cn } from 'cn';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface DashboardSidebarContentProps {
    userInfo: UserInfo,
    navItems: NavSection[],
    dashboardHome: string,
}

const DashboardSidebarContent = ({ dashboardHome, navItems, userInfo }: DashboardSidebarContentProps) => {
    const pathname = usePathname()
    return (

        <div className='hidden md:flex h-full w-64 flex-col border-r bg-card'>
            {/* Logo / Brand */}
            <div className='flex h-16 items-center border-b px-6'>
                <Link href={dashboardHome}>
                    <span className='text-xl font-bold text-primary'>VitalLink</span>
                </Link>
            </div>

            {/* Navigation Area */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className='space-y-6'>
                    {
                        navItems.map((section, sectionId) => (
                            <div key={sectionId}>
                                {
                                    section.title && (
                                        <h4 className='mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>{section.title}</h4>
                                    )
                                }
                                <div className='space-y-1'>
                                    {
                                        section.items.map((item, id) => {
                                            const isActive = pathname === item.href
                                            const Icon = getIconComponent(item.icon)

                                            return (
                                                <Link
                                                    href={item.href}
                                                    key={id}
                                                    className={
                                                        cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                                            isActive ?
                                                                "bg-primary text-primary-foreground" :
                                                                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                        )
                                                    }
                                                >
                                                    <Icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        ))
                    }
                </nav>
            </ScrollArea>
            {/* User Info At Bottom */}
            <div className='border-t px-3 py-4'>
                <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        <span className='text-sm font-semibold text-primary'>{userInfo.name.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className='flex-1 overflow-hidden'>
                        <p className='text-sm font-medium truncate'>{userInfo.name}</p>
                        <p className='text-xs text-muted-foreground capitalize'>{userInfo.role.toLowerCase().replace("_", " ")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebarContent;