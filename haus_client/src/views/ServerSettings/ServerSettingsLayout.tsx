import { Box, Stack, Tabs } from "@mantine/core";
import { IconPuzzle, IconServer, IconUserCog } from "@tabler/icons-react";
import { trimEnd } from "lodash";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export function ServerSettings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        if (trimEnd(location.pathname, "/").split("/").at(-1) === "settings") {
            navigate("/settings/server");
        }
    }, [location.pathname]);

    return (
        <Stack className="server-settings" gap={0}>
            <Tabs
                value={trimEnd(location.pathname, "/").split("/").at(-1)}
                onChange={(value) => navigate(`/settings/${value}`)}
                className="server-settings-tabs"
            >
                <Tabs.List>
                    <Tabs.Tab value="server" leftSection={<IconServer />}>
                        {t("views.settings.tabs.server.tabTitle")}
                    </Tabs.Tab>
                    <Tabs.Tab value="users" leftSection={<IconUserCog />}>
                        {t("views.settings.tabs.users.tabTitle")}
                    </Tabs.Tab>
                    <Tabs.Tab value="plugins" leftSection={<IconPuzzle />}>
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
