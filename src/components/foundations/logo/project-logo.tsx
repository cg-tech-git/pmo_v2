"use client";

import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const ProjectLogo = (props: HTMLAttributes<HTMLImageElement>) => {
    return (
        <img 
            src="/images/allaith.svg" 
            alt="Allaith Logo"
            onError={(e) => {
                console.error('Failed to load logo:', e);
                // Fallback to text if image fails
                e.currentTarget.style.display = 'none';
            }}
            {...props}
            className={cx("shrink-0 h-12 w-auto", props.className)}
        />
    );
};
