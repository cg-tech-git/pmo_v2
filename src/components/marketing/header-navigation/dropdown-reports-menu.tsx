"use client";

import { Award01, Users01 } from "@untitledui/icons";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

const items = [
    {
        title: "Accreditation",
        subtitle: "Reports on certifications and compliance status.",
        href: "/reports/accreditation",
        Icon: Award01,
    },
    {
        title: "Manpower",
        subtitle: "Human resources and staffing reports.",
        href: "/reports/manpower",
        Icon: Users01,
    },
];

export const DropdownReportsMenu = () => {
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

