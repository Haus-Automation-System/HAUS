import { Fieldset, Group, Paper, Stack, Switch, Text } from "@mantine/core";
import {
    isApiError,
    useApi,
    useMultiScoped,
    useScoped,
} from "../../../util/api";
import { useCallback, useEffect, useState } from "react";
import { Plugin } from "../../../types/plugin";
import { NamedIcon } from "../../../util/NamedIcon";
import {
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconPuzzle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

function PluginCard(props: {
    plugin: Plugin;
    canManage: boolean;
    canManageSettings: boolean;
    canManageActive: boolean;
}) {
    const [active, setActive] = useState(props.plugin.active);
    const { t } = useTranslation();

    return (
        <Paper p="md" radius="sm" shadow="sm" className="plugin-card">
            <Stack gap="sm">
                <Group gap="sm" justify="space-between">
                    <Group gap="sm">
                        <NamedIcon
                            icon={props.plugin.manifest.metadata.icon}
                            fallback={<IconPuzzle />}
                            className="plugin-icon"
                            size={32}
                        />
                        <Stack gap={0}>
                            <Text>
                                {props.plugin.manifest.metadata.display_name}
                            </Text>
                            <Text c="dimmed">
                                {props.plugin.id} v
                                {props.plugin.manifest.metadata.version}
                            </Text>
                        </Stack>
                    </Group>
                    <Switch
                        disabled={
                            !props.canManage ||
                            !props.canManageActive ||
                            Boolean(props.plugin.status)
                        }
                        checked={active}
                        onChange={(event) =>
                            setActive(event.currentTarget.checked)
                        }
                        size="lg"
                    />
                </Group>
                <Fieldset
                    p="sm"
                    radius="sm"
                    legend={t("views.settings.tabs.plugins.item.status")}
                    className="plugin-status"
                >
                    <Group gap="sm">
                        {props.plugin.status ? (
                            <IconCircleXFilled
                                className="status-icon error"
                                size={32}
                            />
                        ) : (
                            <IconCircleCheckFilled
                                className="status-icon valid"
                                size={32}
                            />
                        )}
                        {t(
                            props.plugin.status ??
                                "views.settings.tabs.plugins.item.statusValid"
                        )}
                    </Group>
                </Fieldset>
            </Stack>
        </Paper>
    );
}

export function PluginSettingsPanel() {
    const canManage = useScoped(["plugins.manage"]);
    const { pluginsManageSettings, pluginsManageActive } = useMultiScoped([
        {
            scope: "plugins.manage.settings",
        },
        {
            scope: "plugins.manage.active",
        },
    ]);
    const api = useApi();

    const [plugins, setPlugins] = useState<Plugin[]>([]);

    const loadPlugins = useCallback(
        () =>
            api.plugins.list
                .detailed()
                .then((result) =>
                    isApiError(result) ? null : setPlugins(result)
                ),
        [api.plugins.list.detailed, setPlugins]
    );

    useEffect(() => {
        loadPlugins();
    }, []);

    return (
        <Stack gap="sm" className="plugin-settings-panel">
            {plugins.map((plugin) => (
                <PluginCard
                    plugin={plugin}
                    canManage={canManage}
                    canManageActive={pluginsManageActive}
                    canManageSettings={pluginsManageSettings}
                    key={plugin.id}
                />
            ))}
        </Stack>
    );
}
