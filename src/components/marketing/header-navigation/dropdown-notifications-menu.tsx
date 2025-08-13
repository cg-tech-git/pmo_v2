"use client";

import { AlertTriangle, Bell01, MessageSquare02 } from "@untitledui/icons";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

const items = [
    {
        title: "Alerts",
        subtitle: "System alerts and critical notifications.",
        href: "/notifications/alerts",
        Icon: AlertTriangle,
    },
    {
        title: "Notifications",
        subtitle: "General notifications and updates.",
        href: "/notifications/notifications",
        Icon: Bell01,
    },
    {
        title: "Requests",
        subtitle: "Pending requests and approvals.",
        href: "/notifications/requests",
        Icon: MessageSquare02,
    },
];

export const DropdownNotificationsMenu = () => {
    return (
        <div className="px-3 pb-2 md:max-w-84 md:p-0">
            <nav className="overflow-hidden rounded-2xl bg-primary py-2 shadow-xs ring-1 ring-secondary_alt md:p-2 md:shadow-lg">
                <ul className="flex flex-col gap-0.5">
                    {items.map(({ title, subtitle, href, Icon }) => (
                        <li key={title}>
                            <NavMenuItemLink icon={Icon} title={title} subtitle={subtitle} href={href} />
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

