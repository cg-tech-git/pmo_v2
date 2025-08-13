/**
 * Central icon exports module
 * This module re-exports icons from the Pro version by default
 * The Pro icons are organized by style: line, solid, duotone, duocolor
 * We'll use 'line' as the default to match the regular icons style
 */

// Re-export all Pro line icons as the default (matches the regular icons style)
export * from "@untitledui-pro/icons/line";

// Re-export file icons separately as they're in a different package
export * from "@untitledui/file-icons";

// If you need other icon styles, you can import them like this:
// import { IconName } from "@untitledui-pro/icons/solid";
// import { IconName } from "@untitledui-pro/icons/duotone";
// import { IconName } from "@untitledui-pro/icons/duocolor";
