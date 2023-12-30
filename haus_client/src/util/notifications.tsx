import { notifications } from "@mantine/notifications";
import { IconCheck, IconInfoCircleFilled, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ApiResponseError, isApiError } from "./api/types";

export function useNotifications() {
    const { t } = useTranslation();

    return {
        success: (message: string) =>
            notifications.show({
                title: t("common.notifications.success.title"),
                message: message,
                color: "green",
                icon: <IconCheck />,
            }),
        info: (message: string) =>
            notifications.show({
                title: t("common.notifications.info.title"),
                message: message,
                icon: <IconInfoCircleFilled />,
            }),
        error: (message: string | ApiResponseError) =>
            notifications.show({
                title: t("common.notifications.error.title"),
                message: isApiError(message)
                    ? t(message.code ?? "errors.server.unspecified")
                    : message,
                icon: <IconX />,
                color: "red",
            }),
    };
}
