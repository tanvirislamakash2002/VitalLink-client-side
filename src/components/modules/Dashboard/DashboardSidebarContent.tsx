"use client"

import { NavSection } from '@/src/types/dashboard.types';
import { UserInfo } from '@/src/types/user.types';
import Link from 'next/link';
import React from 'react';

interface DashboardSidebarContentProps {
    userInfo: UserInfo,
    navItems: NavSection[],
    dashboardHome: string,
}

const DashboardSidebarContent = ({ dashboardHome, navItems, userInfo }: DashboardSidebarContentProps) => {

    return (

        <div className='hidden md:flex h-full w-64 flex-col border-r bg-card'>
            {/* Logo / Brand */}
            <div className='flex h-16 items-center border-b px-6'>
                <Link href={dashboardHome}>
                    <span className='text-xl font-bold text-primary'>VitalLink</span>
                </Link>
            </div>

            {/* Navigation Area */}

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