"use client";

import { Users01, Award01 } from "@untitledui/icons";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

const items = [
    {
        title: "Accreditation",
        subtitle: "Handle certifications and compliance requirements.",
        href: "/tasks/accreditation",
        Icon: Award01,
    },
    {
        title: "Manpower",
        subtitle: "Manage and track human resources and staffing.",
        href: "/tasks/manpower",
        Icon: Users01,
    },
];

export const DropdownTasksMenu = () => {
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
