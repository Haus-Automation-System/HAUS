import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
    isApiError,
    useApi,
    useApiContext,
    useEvent,
    useScoped,
} from "../../util/api";
import {
    AppShell,
    Group,
    Burger,
    Text,
    Stack,
    ActionIcon,
    Divider,
    Button,
    Paper,
    ThemeIcon,
} from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import AppIcon from "../../assets/haus_icon.svg";
import { useTranslation } from "react-i18next";
import {
    IconLink,
    IconLogout,
    IconServerCog,
    IconUserCog,
} from "@tabler/icons-react";
import { NamedIcon } from "../../util/NamedIcon";
import { Plugin, PluginEvent, RedactedPlugin } from "../../types/plugin";

function NavCard({
    icon,
    name,
    type,
    url,
    subtitle,
    active,
}: {
    icon: string;
    name: string;
    type: "builtin" | "view" | "plugin";
    url: string;
    subtitle?: string;
    active?: boolean;
}) {
    const nav = useNavigate();
    return (
        <Paper
            p="xs"
            radius="sm"
            onClick={() => nav(url)}
            shadow="sm"
            className="nav-card"
            withBorder={active}
        >
            <Group gap="sm" align="center">
                <ThemeIcon
                    color={
                        {
                            builtin: undefined,
                            view: "violet",
                            plugin: "yellow",
                        }[type]
                    }
                    variant="light"
                    radius="xl"
                    size="lg"
                >
                    <NamedIcon
                        icon={icon}
                        fallback={<IconLink size={24} />}
                        size={24}
                    />
                </ThemeIcon>
                <Stack gap={0}>
                    <Text size="md">{name}</Text>
                    {subtitle && (
                        <Text size="sm" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Stack>
            </Group>
        </Paper>
    );
}

export function LayoutView() {
    const nav = useNavigate();
    const { user, authenticationContext } = useApiContext();
    const [opened, { toggle }] = useDisclosure();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();
    const api = useApi();

    useEffect(() => {
        if (!user && authenticationContext) {
            nav("/logged-out");
        }
    }, [user?.id, authenticationContext?.access]);

    const adminScoped = useScoped(["users", "plugins", "server"], {
        mode: "withinScope",
    });

    const pluginScoped = useScoped(["app.plugins"], { mode: "withinScope" });
    const [plugins, setPlugins] = useState<RedactedPlugin[]>([]);

    const loadPlugins = useCallback(
        () =>
            api.plugins.list
                .basic()
                .then((result) =>
                    isApiError(result) ? null : setPlugins(result)
                ),
        [api.plugins.list.detailed, setPlugins]
    );

    useEffect(() => {
        loadPlugins();
    }, []);

    useEvent<PluginEvent>("plugins", ({ data }) => {
        if (data.method === "active" || data.method || "settings") {
            loadPlugins();
        }
    });

    const { pluginId } = useParams();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: !opened },
            }}
            className="app-shell"
        >
            <AppShell.Header className="app-header">
                <Group h="100%" px="md" align="center">
                    <Burger opened={opened} onClick={toggle} size="sm" />
                    <img className={`app-icon ${colorScheme}`} src={AppIcon} />
                    <Text fz={24}>{t("common.appName.short")}</Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md" className="app-nav">
                <Stack gap="sm" className="nav-stack">
                    <Stack gap="sm" className="nav-main">
                        <NavCard
                            icon="home"
                            type="builtin"
                            name={t("views.layout.nav.cards.builtin.home")}
                            url="/"
                        />
                        <Divider label={t("views.layout.nav.dividers.views")} />
                        <NavCard
                            icon="layout"
                            type="view"
                            name="Placeholder"
                            url="/"
                        />
                        {pluginScoped && plugins.length > 0 && (
                            <>
                                <Divider
                                    label={t(
                                        "views.layout.nav.dividers.plugins"
                                    )}
                                />
                                {plugins.map((plugin) => (
                                    <NavCard
                                        icon={plugin.metadata.icon}
                                        type="plugin"
                                        name={plugin.metadata.display_name}
                                        url={`/plugin/${plugin.id}`}
                                        subtitle={
                                            plugin.id +
                                            " v" +
                                            plugin.metadata.version
                                        }
                                        active={plugin.id === pluginId}
                                        key={plugin.id}
                                    />
                                ))}
                            </>
                        )}
                    </Stack>
                    <Divider />
                    <Group gap="xs" className="nav-actions">
                        {adminScoped && (
                            <ActionIcon
                                variant="subtle"
                                size="xl"
                                onClick={() => nav("/settings/server")}
                            >
                                <IconServerCog size={28} />
                            </ActionIcon>
                        )}
                        <ActionIcon variant="subtle" size="xl">
                            <IconUserCog size={28} />
                        </ActionIcon>
                        <Button
                            rightSection={<IconLogout />}
                            size="md"
                            style={{ flexGrow: 1 }}
                            justify="space-between"
                            onClick={() =>
                                api.users.self
                                    .logout()
                                    .then(() => nav("/logged-out"))
                            }
                        >
                            {t("views.layout.nav.actions.logout")}
                        </Button>
                    </Group>
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main className="app-main">
                <div className="app-content">
                    <Outlet />
                </div>
            </AppShell.Main>
        </AppShell>
    );
}
