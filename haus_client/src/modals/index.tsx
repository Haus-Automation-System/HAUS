import { Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBolt, IconUserPlus } from "@tabler/icons-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CreateUserModal } from "./CreateUserModal";
import { EntityAction } from "../types/pluginTypes/action";
import { Entity } from "../types/pluginTypes/entity";
import { CallActionModal } from "./CallActionModal";
import { RedactedPlugin } from "../types/plugin";

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
        callAction: (
            plugin: RedactedPlugin,
            action: EntityAction,
            target: Entity | null,
            onComplete: (result: {
                action: string;
                target: Entity | null;
                fields: { [key: string]: any };
            }) => void,
            entities: Entity[]
        ) => {
            modals.open({
                title: (
                    <ModalTitle
                        title={t("modals.callAction.title")}
                        icon={<IconBolt />}
                    />
                ),
                children: (
                    <CallActionModal
                        plugin={plugin}
                        action={action}
                        target={target}
                        onComplete={onComplete}
                        entities={entities}
                    />
                ),
                size: "lg",
                closeOnEscape: false,
            });
        },
    };
}
