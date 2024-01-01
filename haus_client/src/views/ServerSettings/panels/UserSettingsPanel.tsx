import { useCallback, useEffect, useMemo, useState } from "react";
import {
    hasScope,
    isApiError,
    useApi,
    useMultiScoped,
    useScoped,
} from "../../../util/api";
import { User } from "../../../types/auth";
import {
    Avatar,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
} from "@mantine/core";
import { IconUser, IconUserShield } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@mantine/hooks";

function UserCard({
    user,
    scopes,
}: {
    user: User;
    scopes: {
        canManage: boolean;
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
    };
}) {
    const userEnabled = useMemo(
        () => hasScope(user, "app.user") || hasScope(user, "app.kiosk"),
        [user.scopes]
    );

    const { t } = useTranslation();
    const colorScheme = useColorScheme();

    return (
        <Paper p="md" radius="sm" shadow="sm" className="user-card">
            <Stack gap="sm">
                <Group gap="sm" justify="space-between">
                    <Group gap="sm">
                        <Avatar size="lg" src={user.user_icon ?? undefined}>
                            {!user.user_icon && <IconUser />}
                        </Avatar>
                        <Stack gap={0}>
                            <Text size="lg">
                                {user.display_name ?? user.username}
                            </Text>
                            <Text c="dimmed">{user.username}</Text>
                        </Stack>
                    </Group>
                    {user.scopes.includes("root") ? (
                        <Tooltip
                            label={t("views.settings.tabs.users.item.isRoot")}
                            withArrow
                            color={colorScheme === "dark" ? "dark" : undefined}
                        >
                            <ThemeIcon
                                variant="light"
                                size="xl"
                                radius="xl"
                                color="violet"
                            >
                                <IconUserShield
                                    style={{ width: "70%", height: "70%" }}
                                />
                            </ThemeIcon>
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

export function UsersSettingsPanel() {
    const canManage = useScoped(["users.manage"], { mode: "withinScope" });
    const {
        usersManageCreate: canCreate,
        usersManageEdit: canEdit,
        usersManageDelete: canDelete,
    } = useMultiScoped([
        {
            scope: "users.manage.create",
        },
        {
            scope: "users.manage.edit",
        },
        {
            scope: "users.manage.delete",
        },
    ]);
    const api = useApi();
    const [users, setUsers] = useState<User[]>([]);

    const loadUsers = useCallback(
        () =>
            api.users.admin
                .list()
                .then((result) =>
                    isApiError(result) ? setUsers([]) : setUsers(result)
                ),
        [api.users.admin.list, setUsers]
    );

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <SimpleGrid
            spacing="sm"
            verticalSpacing="sm"
            cols={{ base: 1, md: 2, xl: 3 }}
            className="users-settings-grid"
        >
            {users.map((v) => (
                <UserCard
                    user={v}
                    scopes={{ canManage, canCreate, canEdit, canDelete }}
                    key={v.id}
                />
            ))}
        </SimpleGrid>
    );
}
