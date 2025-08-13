"use client";

import { Button as AriaButton, DialogTrigger, Popover } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { NavAccountMenu } from "@/components/application/app-navigation/base-components/nav-account-card";
import { cx } from "@/utils/cx";

export const UserAvatarDropdown = () => {
    return (
        <DialogTrigger>
            <AriaButton
                className={({ isPressed, isFocused }) =>
                    cx(
                        "group relative inline-flex cursor-pointer",
                        (isPressed || isFocused) && "rounded-full outline-2 outline-offset-2 outline-focus-ring",
                    )
                }
            >
                <Avatar 
                    alt="John Doe" 
                    src="https://www.untitledui.com/images/avatars/olivia-rhye?bg=%23E0E0E0" 
                    size="md" 
                    status="online"
                />
            </AriaButton>
            <Popover
                placement="bottom right"
                offset={8}
                className={({ isEntering, isExiting }) =>
                    cx(
                        "will-change-transform",
                        isEntering &&
                            "duration-300 ease-out animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2",
                        isExiting &&
                            "duration-150 ease-in animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2",
                    )
                }
            >
                <NavAccountMenu />
            </Popover>
        </DialogTrigger>
    );
};
