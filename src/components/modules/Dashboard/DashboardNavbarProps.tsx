import { NavSection } from '@/src/types/dashboard.types';
import { UserInfo } from '@/src/types/user.types';
import React, { useState } from 'react';

interface DashboardNavbarProps {
    userInfo: UserInfo;
    navItems: NavSection[];
    dashboardHome: string
}
const DashboardNavbarProps = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {

    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            {/* Mobile Menu Toggle Button And Menu  */}

            {/* Search component */}

            {/* Right Side Actions */}

            {/* Notification */}

            {/* User Dropdown */}

        </>
    );
};

export default DashboardNavbarProps;