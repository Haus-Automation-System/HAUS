import { Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUserPlus } from "@tabler/icons-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CreateUserModal } from "./CreateUserModal";

function ModalTitle({
    title,
    subtitle,
    icon,
}: {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
}) {
    return (
        <Group gap="sm" className="modal-title">
            {icon}
            <Stack gap={0} className="title-text">
                <Text size="lg">{title}</Text>
                {subtitle && <Text c="dimmed">{subtitle}</Text>}
            </Stack>
        </Group>
    );
}

export function useModals() {
    const { t } = useTranslation();
    return {
        createUser: () =>
            modals.open({
                title: (
                    <ModalTitle
                        title={t("modals.createUser.title")}
                        icon={<IconUserPlus />}
                    />
                ),
                children: <CreateUserModal />,
                size: "lg",
                closeOnEscape: false,
            }),
    };
}
