"use client";

import { GitBranch01, TrendUp02, File01, Receipt, FileCheck02 } from "@untitledui/icons";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

const items = [
    {
        title: "Project Flowchart",
        subtitle: "Visual workflow templates for project processes.",
        href: "/templates/project-flowchart",
        Icon: GitBranch01,
    },
    {
        title: "Commercial Flowchart",
        subtitle: "Business process templates for commercial workflows.",
        href: "/templates/commercial-flowchart",
        Icon: TrendUp02,
    },
    {
        title: "Project Documents",
        subtitle: "Standard document templates for project management.",
        href: "/templates/project-documents",
        Icon: File01,
    },
    {
        title: "Commercial Documents",
        subtitle: "Business document templates and forms.",
        href: "/templates/commercial-documents",
        Icon: Receipt,
    },
    {
        title: "Tender Documents",
        subtitle: "Procurement and tender document templates.",
        href: "/templates/tender-documents",
        Icon: FileCheck02,
    },
];

export const DropdownTemplatesMenu = () => {
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
