"use client";

import type { FC } from "react";
import { usePathname } from "next/navigation";
import {
    Archive,
    BarChartSquare02,
    CheckDone01,
    ClockFastForward,
    CurrencyDollarCircle,
    Grid03,
    HomeLine,
    Inbox01,
    LifeBuoy01,
    LineChartUp03,
    NotificationBox,
    Package,
    PieChart03,
    Rows01,
    Settings01,
    Settings03,
    Star01,
    Stars01,
    User01,
    UserSquare,
    Users01,
    UsersPlus,
} from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";

export const SidebarNavigationSlimDemo = () => {
    const pathname = usePathname();
    const navItemsDualTier: (NavItemType & { icon: FC<{ className?: string }> })[] = [
        {
            label: "Home",
            href: "/",
            icon: HomeLine,
        },
        {
            label: "Tasks",
            href: "/tasks",
            icon: CheckDone01,
            badge: 10,
        },
        {
            label: "Reports",
            href: "/reports",
            icon: PieChart03,
        },
        {
            label: "Notifications",
            href: "/notifications",
            icon: NotificationBox,
            badge: 5,
        },
    ];

    return (
        <SidebarNavigationSlim
            items={navItemsDualTier}
            activeUrl={pathname}
            hideBorder={true}
            footerItems={[
                {
                    label: "Support",
                    href: "/support",
                    icon: LifeBuoy01,
                },
                {
                    label: "Settings",
                    href: "/settings",
                    icon: Settings01,
                },
            ]}
        />
    );
};
