"use client"

import { Button } from '@/components/ui/button';
import { NavSection } from '@/types/dashboard.types';
import { UserInfo } from '@/types/user.types';
import { Menu, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DashboardMobileSidebar from './DashboardMobileSidebar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';

interface DashboardNavbarProps {
    userInfo: UserInfo;
    navItems: NavSection[];
    dashboardHome: string
}
const DashboardNavbarContent = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {

    const [isOpen, setIsOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkSmallScreen = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkSmallScreen()
        window.addEventListener("resize", checkSmallScreen)

        return () => {
            window.removeEventListener("resize", checkSmallScreen)
        }
    }, [])
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
            {/* Mobile Menu Toggle Button And Menu  */}
            <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                    <Button variant={"outline"} size={"icon"}>
                        <Menu className='h-5 w-5' />
                    </Button>
                </SheetTrigger>

                <SheetContent side="left" className='w-64 p-0'>
                    <DashboardMobileSidebar userInfo={userInfo} dashboardHome={dashboardHome} navItems={navItems} />
                </SheetContent>
            </Sheet>
            {/* Search component */}
            <div className="min-w-0 flex-1">
                <div className="relative hidden w-full sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input type='text' placeholder='Search...' className='pl-9 pr-4' />
                </div>
            </div>
            {/* Right Side Actions */}

            {/* Notification */}
            <NotificationDropdown />

            {/* User Dropdown */}
            <UserDropdown userInfo={userInfo} />
        </header>
    );
};

export default DashboardNavbarContent;