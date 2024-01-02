import { useCallback, useEffect, useState } from "react";
import {
    hasScope,
    isApiError,
    useApi,
    useEvent,
    useMultiScoped,
    useScoped,
    useUser,
} from "../../../util/api";
import { User } from "../../../types/auth";
import {
    ActionIcon,
    Avatar,
    Button,
    Group,
    Modal,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
} from "@mantine/core";
import {
    IconCheck,
    IconShield,
    IconTrashXFilled,
    IconUser,
    IconUserEdit,
    IconUserPlus,
    IconUserShield,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@mantine/hooks";
import { useModals } from "../../../modals";
import { ScopeSelect } from "../../../components/ScopeSelection/ScopeSelect";
import { isEqual } from "lodash";

function InnerUserCard({ user }: { user: User }) {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    return (
        <Paper p="md" radius="sm" shadow="sm" className="user-card inner">
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
                        <Tooltip
                            label={t("views.settings.tabs.users.item.isNormal")}
                            withArrow
                            color={colorScheme === "dark" ? "dark" : undefined}
                        >
                            <ThemeIcon variant="light" size="xl" radius="xl">
                                <IconUser
                                    style={{ width: "70%", height: "70%" }}
                                />
                            </ThemeIcon>
                        </Tooltip>
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

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
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const [editing, setEditing] = useState(false);
    const [newScopes, setNewScopes] = useState(user.scopes);
    const currentUser = useUser();
    const [mode, setMode] = useState(
        hasScope(user, "app.user") || hasScope(user, "app.kiosk")
            ? hasScope(user, "app.user")
                ? "user"
                : "kiosk"
            : "disabled"
    );

    const api = useApi();

    return (
        <Paper
            p="md"
            radius="sm"
            shadow="sm"
            className="user-card"
            onClick={() => {
                setEditing(true);
                setNewScopes(user.scopes);
            }}
        >
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
                        <Tooltip
                            label={t("views.settings.tabs.users.item.isNormal")}
                            withArrow
                            color={colorScheme === "dark" ? "dark" : undefined}
                        >
                            <ThemeIcon variant="light" size="xl" radius="xl">
                                <IconUser
                                    style={{ width: "70%", height: "70%" }}
                                />
                            </ThemeIcon>
                        </Tooltip>
                    )}
                </Group>
            </Stack>
            <Modal
                opened={editing}
                title={
                    <Group gap="sm" className="modal-title">
                        <IconUserEdit />
                        <Stack gap={0} className="title-text">
                            <Text size="lg">{t("modals.editUser.title")}</Text>
                            <Text c="dimmed">{user.username}</Text>
                        </Stack>
                    </Group>
                }
                onClose={() => setEditing(false)}
                onClick={(e) => e.stopPropagation()}
                size="lg"
            >
                <Stack gap="sm">
                    <InnerUserCard user={user} />
                    <ScopeSelect
                        value={newScopes}
                        onChange={setNewScopes}
                        user={currentUser ?? undefined}
                        label={t("modals.editUser.scopes.label")}
                        leftSection={<IconShield size={16} />}
                        disabled={
                            !scopes.canManage ||
                            !scopes.canEdit ||
                            user.scopes.includes("root") ||
                            currentUser?.id === user.id
                        }
                        rightSection={
                            scopes.canManage &&
                            scopes.canEdit &&
                            !user.scopes.includes("root") &&
                            currentUser?.id !== user.id && (
                                <ActionIcon
                                    size="xl"
                                    variant="transparent"
                                    mr="md"
                                    disabled={isEqual(newScopes, user.scopes)}
                                    onClick={() =>
                                        api.users.admin
                                            .setScopes(user.id, newScopes)
                                            .then(
                                                (result) =>
                                                    !isApiError(result) &&
                                                    setNewScopes(result.scopes)
                                            )
                                    }
                                >
                                    <IconCheck />
                                </ActionIcon>
                            )
                        }
                    />
                    <Group gap="sm">
                        <SegmentedControl
                            disabled={
                                !scopes.canManage ||
                                !scopes.canEdit ||
                                user.scopes.includes("root")
                            }
                            data={[
                                {
                                    value: "user",
                                    label: t("modals.editUser.status.user"),
                                },
                                {
                                    value: "kiosk",
                                    label: t("modals.editUser.status.kiosk"),
                                },
                                {
                                    value: "disabled",
                                    label: t("modals.editUser.status.disabled"),
                                    disabled: currentUser?.id === user.id,
                                },
                            ]}
                            value={mode}
                            onChange={(newMode: string) => {
                                setMode(newMode);

                                let updatedScopes = user.scopes.filter(
                                    (v) => v !== "app.user" && v !== "app.kiosk"
                                );
                                switch (newMode) {
                                    case "kiosk":
                                        updatedScopes.push("app.kiosk");
                                        break;
                                    case "user":
                                        updatedScopes.push("app.user");
                                        break;
                                    case "disabled":
                                        updatedScopes = updatedScopes.filter(
                                            (v) => v !== "app"
                                        );
                                        break;
                                }

                                api.users.admin
                                    .setScopes(user.id, updatedScopes)
                                    .then(
                                        (result) =>
                                            !isApiError(result) &&
                                            setNewScopes(result.scopes)
                                    );
                            }}
                            style={{ flexGrow: 8 }}
                        />
                        {scopes.canManage &&
                            scopes.canDelete &&
                            !user.scopes.includes("root") && (
                                <Button
                                    color="red"
                                    leftSection={<IconTrashXFilled size={20} />}
                                    style={{ flexGrow: 1 }}
                                    justify="space-between"
                                    onClick={() =>
                                        api.users.admin
                                            .delete(user.id)
                                            .then(() => setEditing(false))
                                    }
                                >
                                    {t("modals.editUser.delete")}
                                </Button>
                            )}
                    </Group>
                </Stack>
            </Modal>
        </Paper>
    );
}

export function UsersSettingsPanel() {
    const withinManage = useScoped(["users.manage"], { mode: "withinScope" });
    const hasManage = useScoped(["users.manage"]);
    const canManage = withinManage || hasManage;
    const { t } = useTranslation();
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

    const { createUser } = useModals();

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

    useEvent("users", () => loadUsers());

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
            {canCreate && (
                <Paper
                    p="md"
                    radius="sm"
                    className="user-card add-user"
                    withBorder
                    onClick={() => createUser()}
                >
                    <Group
                        gap="lg"
                        align="center"
                        justify="center"
                        h="100%"
                        className="add-user-text"
                    >
                        <IconUserPlus size={28} />
                        <Text size="xl">
                            {t("views.settings.tabs.users.add.button")}
                        </Text>
                    </Group>
                </Paper>
            )}
        </SimpleGrid>
    );
}
