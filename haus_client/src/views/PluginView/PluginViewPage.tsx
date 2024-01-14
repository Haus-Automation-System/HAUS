import { useNavigate, useParams } from "react-router-dom";
import { isApiError, useApi, useMultiScoped, useUser } from "../../util/api";
import { useEffect, useMemo, useState } from "react";
import { RedactedPlugin } from "../../types/plugin";
import {
    Box,
    Divider,
    Group,
    Loader,
    MultiSelect,
    ScrollArea,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { NamedIcon } from "../../util/NamedIcon";
import { IconFilter, IconPuzzle } from "@tabler/icons-react";
import { Entity } from "../../types/pluginTypes/entity";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { EntityCard } from "./EntityCard";
import { capitalize, uniq } from "lodash";

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

    const [entities, setEntities] = useState<Entity[]>([]);

    useEffect(() => {
        if (plugin && plugin.active) {
            api.plugins
                .getEntities(plugin.id)
                .then((result) =>
                    setEntities(isApiError(result) ? [] : result)
                );
        }
    }, [plugin?.id]);

    const [filter, setFilter] = useState<string[]>([]);
    const entityTypes = useMemo(
        () =>
            uniq(entities.map((e) => e.type)).map((e) => ({
                value: e,
                label: capitalize(e),
            })),
        [entities]
    );

    return plugin ? (
        <Box className="plugin-view-main loaded">
            <Stack gap={0} className="stack-main">
                <Group justify="space-between">
                    <Group gap="md" align="center" p="sm">
                        <ThemeIcon size="xl" radius="xl" variant="light">
                            <NamedIcon
                                icon={plugin.metadata.icon}
                                fallback={<IconPuzzle />}
                            />
                        </ThemeIcon>
                        <Stack gap={0} style={{ flexGrow: 1 }}>
                            <Text>{plugin.metadata.display_name}</Text>
                            <Text c="dimmed">
                                {plugin.id} v{plugin.metadata.version}
                            </Text>
                        </Stack>
                    </Group>
                    <Group gap="sm" p="sm">
                        <MultiSelect
                            data={entityTypes}
                            value={filter}
                            onChange={setFilter}
                            leftSection={<IconFilter size={20} />}
                            clearable
                            maw="50vw"
                            miw="256px"
                        />
                    </Group>
                </Group>
                <Divider />
                <ScrollArea p="sm" className="plugin-container">
                    <ResponsiveMasonry
                        columnsCountBreakPoints={{ 576: 1, 992: 2, 1200: 3 }}
                    >
                        <Masonry gutter="8px">
                            {entities
                                .filter(
                                    (v) =>
                                        filter.length === 0 ||
                                        filter.includes(v.type)
                                )
                                .map((entity) => (
                                    <EntityCard
                                        plugin={plugin}
                                        entity={entity}
                                        key={entity.id}
                                    />
                                ))}
                        </Masonry>
                    </ResponsiveMasonry>
                </ScrollArea>
            </Stack>
        </Box>
    ) : (
        <Box className="plugin-view-main unloaded">
            <Loader size="xl" className="plugin-loader" />
        </Box>
    );
}
