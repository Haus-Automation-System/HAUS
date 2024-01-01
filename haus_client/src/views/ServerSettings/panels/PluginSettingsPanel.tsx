import {
    Button,
    Fieldset,
    Group,
    NumberInput,
    Paper,
    SimpleGrid,
    Space,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import {
    isApiError,
    useApi,
    useEvent,
    useMultiScoped,
    useScoped,
} from "../../../util/api";
import { useCallback, useEffect, useState } from "react";
import { Plugin, PluginEvent } from "../../../types/plugin";
import { NamedIcon } from "../../../util/NamedIcon";
import {
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconDeviceFloppy,
    IconPuzzle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";

function PluginCard(props: {
    plugin: Plugin;
    canManage: boolean;
    canManageSettings: boolean;
    canManageActive: boolean;
}) {
    const [active, setActive] = useState(props.plugin.active);
    const { t } = useTranslation();
    const settingsForm = useForm({ initialValues: props.plugin.settings });
    const api = useApi();
    const [reloading, setReloading] = useState<boolean>(false);

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
                        onChange={(event) => {
                            setActive(event.currentTarget.checked);
                            api.plugins.setActive(
                                props.plugin.id,
                                event.currentTarget.checked
                            );
                        }}
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
                        {props.plugin.status ??
                            t("views.settings.tabs.plugins.item.statusValid")}
                    </Group>
                </Fieldset>
                <Fieldset
                    p="sm"
                    radius="sm"
                    legend={t(
                        "views.settings.tabs.plugins.item.settings.title"
                    )}
                    className="plugin-settings"
                    disabled={!props.canManageSettings}
                >
                    <form
                        onSubmit={settingsForm.onSubmit((values) => {
                            setReloading(true);
                            api.plugins
                                .updateSettings(props.plugin.id, values)
                                .then(() => setReloading(false));
                        })}
                    >
                        <SimpleGrid
                            spacing="sm"
                            verticalSpacing="sm"
                            cols={{ base: 1, md: 2 }}
                        >
                            {Object.entries(props.plugin.manifest.settings).map(
                                ([id, field]) => {
                                    switch (field.type) {
                                        case "string":
                                            return (
                                                <TextInput
                                                    withAsterisk={
                                                        field.required
                                                    }
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                    label={field.name}
                                                    key={id}
                                                    leftSection={
                                                        field.icon && (
                                                            <NamedIcon
                                                                icon={
                                                                    field.icon
                                                                }
                                                                fallback={
                                                                    <IconPuzzle
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                }
                                                                size={20}
                                                            />
                                                        )
                                                    }
                                                    {...settingsForm.getInputProps(
                                                        id
                                                    )}
                                                />
                                            );
                                        case "number":
                                            return (
                                                <NumberInput
                                                    withAsterisk={
                                                        field.required
                                                    }
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                    label={field.name}
                                                    key={id}
                                                    {...settingsForm.getInputProps(
                                                        id
                                                    )}
                                                    min={field.min ?? undefined}
                                                    max={field.max ?? undefined}
                                                    leftSection={
                                                        field.icon && (
                                                            <NamedIcon
                                                                icon={
                                                                    field.icon
                                                                }
                                                                fallback={
                                                                    <IconPuzzle
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                }
                                                                size={20}
                                                            />
                                                        )
                                                    }
                                                />
                                            );
                                        case "switch":
                                            return (
                                                <Switch
                                                    label={field.name}
                                                    key={id}
                                                    thumbIcon={
                                                        field.icon && (
                                                            <NamedIcon
                                                                icon={
                                                                    field.icon
                                                                }
                                                                fallback={
                                                                    <IconPuzzle
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                }
                                                                size={20}
                                                            />
                                                        )
                                                    }
                                                    {...settingsForm.getInputProps(
                                                        id
                                                    )}
                                                />
                                            );
                                    }
                                }
                            )}
                        </SimpleGrid>
                        <Space h="sm" />
                        <Group justify="right">
                            <Button
                                leftSection={<IconDeviceFloppy />}
                                type="submit"
                                loading={reloading}
                            >
                                {t(
                                    "views.settings.tabs.plugins.item.settings.apply"
                                )}
                            </Button>
                        </Group>
                    </form>
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

    useEvent<PluginEvent>("plugins", ({ data }) => {
        if (data.method === "active" || data.method || "settings") {
            loadPlugins();
        }
    });

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
