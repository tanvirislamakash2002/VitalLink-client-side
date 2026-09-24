"use client"

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavSection } from '@/src/types/dashboard.types';
import { UserInfo } from '@/src/types/user.types';
import { Menu, Search } from 'lucide-react';
import React, { useState } from 'react';
import DashboardMobileSidebar from './DashboardMobileSidebar';
import { Input } from '@/components/ui/input';

interface DashboardNavbarProps {
    userInfo: UserInfo;
    navItems: NavSection[];
    dashboardHome: string
}
const DashboardNavbarContent = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {

    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            {/* Mobile Menu Toggle Button And Menu  */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="flex-1 flex items-center justify-end gap-2">
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 translate-y-1/2 h-4 w-4" />
                    <Input type='text' placeholder='Search...' className='pl-9 pr-4' />
                </div>
            </div>
            {/* Right Side Actions */}

            {/* Notification */}

            {/* User Dropdown */}

        </>
    );
};

export default DashboardNavbarContent;