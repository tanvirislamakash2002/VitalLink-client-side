import { getDefaultDashboardRoute } from '@/src/lib/authUtils';
import { getNavItemsByRole } from '@/src/lib/navItems';
import { getUserInfo } from '@/src/services/auth.services';
import { NavSection } from '@/src/types/dashboard.types';
import React from 'react';

const DashboardNavbar = async () => {
    const userInfo = await getUserInfo()
    const navItems: NavSection[] = getNavItemsByRole(userInfo.role)

    const dashboardHome = getDefaultDashboardRoute(userInfo.role)
    return (
        <div>

        </div>
    );
};

export default DashboardNavbar;