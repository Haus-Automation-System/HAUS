import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useApi, useApiContext, useScoped } from "../../util/api";
import {
    AppShell,
    Group,
    Burger,
    Text,
    Stack,
    ActionIcon,
    Divider,
    Button,
} from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import AppIcon from "../../assets/haus_icon.svg";
import { useTranslation } from "react-i18next";
import { IconLogout, IconServerCog, IconUserCog } from "@tabler/icons-react";

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
                    <Stack gap="sm" className="nav-main"></Stack>
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
