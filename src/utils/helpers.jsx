import { notifications } from "@mantine/notifications";
import {
    IconAlertTriangle,
    IconCircleCheck,
    IconInfoCircle,
    IconXboxX,
} from "@tabler/icons-react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

//return environment variables without the "VITE_" prefix
export const env = (key, fallback = undefined) => {
    const fullKey = `VITE_${key}`;
    const value = import.meta.env[fullKey];

    if (value === undefined || value === "") {
        if (fallback !== undefined) return fallback;
        throw new Error(`Missing VITE env variable: ${fullKey}`);
    }

    return value;
};

//notify users through <Notifications> component from @mantine/notifications library
export const notify = ({
    title = "Error",
    message = "Oops! Something went wrong",
    color = "transparent",
    iconType = "error",
    icon,
    ...props
} = {}) => {
    const iconTypes = {
        error: <IconXboxX stroke={2} className="text-red-500" />,
        warning: <IconAlertTriangle stroke={2} className="text-yellow-500" />,
        success: <IconCircleCheck stroke={2} className="text-green-500" />,
        info: <IconInfoCircle stroke={2} className="text-blue-500" />,
    };

    // Validate iconType; default to "error" if invalid
    const validIconType = iconTypes.hasOwnProperty(iconType)
        ? iconType
        : "error";

    notifications.show({
        title,
        message,
        color,
        icon: icon || iconTypes[validIconType],
        ...props,
    });
};

/** Convert a timestamp to human readable diff string */
export const diffForHumans = (timestamp) => {
    if (!timestamp) return "";

    dayjs.extend(relativeTime);

    const time = dayjs.unix(timestamp);
    const secondsDiff = dayjs().diff(time, "seconds");

    if (secondsDiff < 10) {
        return "Just Now";
    }

    return time.fromNow();
};


export const capitalize = (str) => {
  if (!str) return '';
  return str
    .split(' ')                // split by space for multi-word entities
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
