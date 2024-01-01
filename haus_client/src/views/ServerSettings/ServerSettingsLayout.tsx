import { Box, Stack, Tabs } from "@mantine/core";
import { IconPuzzle, IconServer, IconUserCog } from "@tabler/icons-react";
import { trimEnd } from "lodash";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMultiScoped, useScoped, useUser } from "../../util/api";

export function ServerSettings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const user = useUser();

    const scopedAccessSettings = useScoped(["users", "plugins", "server"], {
        mode: "withinScope",
    });
    const {
        users: usersScoped,
        plugins: pluginsScoped,
        server: serverScoped,
    } = useMultiScoped([
        { scope: "users", mode: "withinScope" },
        { scope: "plugins", mode: "withinScope" },
        { scope: "server", mode: "withinScope" },
    ]);

    const firstAvailablePanel = useMemo(() => {
        if (serverScoped) {
            return "server";
        }

        if (usersScoped) {
            return "users";
        }

        if (pluginsScoped) {
            return "plugins";
        }

        return "server";
    }, [usersScoped, pluginsScoped, serverScoped]);

    useEffect(() => {
        if (!scopedAccessSettings && user) {
            navigate("/");
        }
    }, [scopedAccessSettings, user?.id, user?.scopes]);

    useEffect(() => {
        if (
            trimEnd(location.pathname, "/").split("/").at(-1) === "settings" &&
            scopedAccessSettings
        ) {
            navigate(`/settings/${firstAvailablePanel}`);
        }
    }, [location.pathname, scopedAccessSettings]);

    useEffect(() => {
        const panel: string =
            trimEnd(location.pathname, "/").split("/").at(-1) ?? "";
        if (
            !{
                server: serverScoped,
                users: usersScoped,
                plugins: pluginsScoped,
            }[panel] &&
            user &&
            scopedAccessSettings
        ) {
            navigate(`/settings/${firstAvailablePanel}`);
        }
    }, [
        serverScoped,
        usersScoped,
        pluginsScoped,
        location.pathname,
        firstAvailablePanel,
        user?.id,
        user?.scopes,
        scopedAccessSettings,
    ]);

    return (
        <Stack className="server-settings" gap={0}>
            <Tabs
                value={trimEnd(location.pathname, "/").split("/").at(-1)}
                onChange={(value) => navigate(`/settings/${value}`)}
                className="server-settings-tabs"
            >
                <Tabs.List>
                    <Tabs.Tab
                        value="server"
                        leftSection={<IconServer />}
                        disabled={!serverScoped}
                    >
                        {t("views.settings.tabs.server.tabTitle")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="users"
                        leftSection={<IconUserCog />}
                        disabled={!usersScoped}
                    >
                        {t("views.settings.tabs.users.tabTitle")}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="plugins"
                        leftSection={<IconPuzzle />}
                        disabled={!pluginsScoped}
                    >
                        {t("views.settings.tabs.plugins.tabTitle")}
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
            <Box className="server-settings-content" p="md">
                <Outlet />
            </Box>
        </Stack>
    );
}
