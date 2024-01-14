import { useNavigate, useParams } from "react-router-dom";
import { isApiError, useApi, useMultiScoped, useUser } from "../../util/api";
import { useEffect, useState } from "react";
import { RedactedPlugin } from "../../types/plugin";
import { Box, Divider, Group, Loader, Stack, ThemeIcon } from "@mantine/core";
import { NamedIcon } from "../../util/NamedIcon";
import { IconPuzzle } from "@tabler/icons-react";

export function PluginViewPage() {
    const { pluginId } = useParams();
    const { has, within } = useMultiScoped([
        {
            scope: `app.plugins.${pluginId ?? "-"}`,
            mode: "hasScope",
            alias: "has",
        },
        {
            scope: `app.plugins.${pluginId ?? "-"}`,
            mode: "withinScope",
            alias: "within",
        },
    ]);
    const isScoped = has || within;

    const nav = useNavigate();
    const user = useUser();
    const api = useApi();

    useEffect(() => {
        if (user && !isScoped) {
            nav("/");
        }
    }, [isScoped, user?.id]);

    const [plugin, setPlugin] = useState<RedactedPlugin | null>(null);

    useEffect(() => {
        api.plugins.info
            .basic(pluginId ?? "null")
            .then((result) => setPlugin(isApiError(result) ? null : result));
    }, [pluginId]);

    return plugin ? (
        <Box className="plugin-view-main loaded">
            <Stack gap={0} className="stack-main">
                <Group gap="md" align="center" p="sm">
                    <ThemeIcon size="xl" radius="xl" variant="light">
                        <NamedIcon
                            icon={plugin.metadata.icon}
                            fallback={<IconPuzzle />}
                        />
                    </ThemeIcon>
                </Group>
                <Divider />
            </Stack>
        </Box>
    ) : (
        <Box className="plugin-view-main unloaded">
            <Loader size="xl" className="plugin-loader" />
        </Box>
    );
}
