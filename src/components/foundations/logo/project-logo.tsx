"use client";

import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const ProjectLogo = (props: HTMLAttributes<HTMLImageElement>) => {
    return (
        <img 
            src="/images/allaith.svg" 
            alt="Allaith Logo"
            {...props}
            className={cx("shrink-0 h-12 w-auto", props.className)}
        />
    );
};
