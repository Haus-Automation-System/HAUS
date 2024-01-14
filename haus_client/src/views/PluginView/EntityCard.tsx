import {
    Badge,
    Group,
    Paper,
    ScrollAreaAutosize,
    Stack,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { RedactedPlugin } from "../../types/plugin";
import { Entity } from "../../types/pluginTypes/entity";
import { memo } from "react";
import { NamedIcon } from "../../util/NamedIcon";
import { IconHexagon, IconSettings2 } from "@tabler/icons-react";
import { PropertyRenderer } from "../../components/PluginData/PropertyRenderer";
import { ActionSelector } from "./ActionSelector";
import { EntityAction } from "../../types/pluginTypes/action";
import { some } from "lodash";

export const EntityCard = memo(
    ({
        entity,
        plugin,
        actions,
    }: {
        entity: Entity;
        plugin: RedactedPlugin;
        actions: EntityAction[];
    }) => {
        return (
            <Paper className="entity-card" shadow="sm" radius="sm" p="sm">
                <Stack className="main-stack" gap="sm">
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" align="center" wrap="nowrap">
                            <ThemeIcon
                                size="lg"
                                radius="xl"
                                variant="transparent"
                            >
                                <NamedIcon
                                    icon={entity.display.icon ?? "settings-2"}
                                    fallback={<IconSettings2 />}
                                />
                            </ThemeIcon>
                            <Stack gap={2}>
                                <Text>{entity.display.label}</Text>
                                <Badge variant="light">{entity.type}</Badge>
                            </Stack>
                        </Group>
                        <ActionSelector
                            actions={actions}
                            filter={(a) =>
                                some(a.target_types ?? [], (v) =>
                                    entity.id.startsWith(v)
                                )
                            }
                        />
                    </Group>
                    {Object.entries(entity.properties).map(
                        ([key, property]) => (
                            <Paper
                                className="entity-property"
                                withBorder
                                p="sm"
                                radius="sm"
                                key={key}
                            >
                                <Stack gap="xs">
                                    <Group
                                        gap="xs"
                                        align="center"
                                        wrap="nowrap"
                                    >
                                        <ThemeIcon
                                            variant="transparent"
                                            radius="xl"
                                        >
                                            <NamedIcon
                                                icon={
                                                    property.display.icon ??
                                                    "hexagon"
                                                }
                                                fallback={
                                                    <IconHexagon size={18} />
                                                }
                                                size={18}
                                            />
                                        </ThemeIcon>
                                        <Stack gap={0}>
                                            <Text>
                                                {property.display.label}
                                            </Text>
                                            {property.display.sub_label && (
                                                <Text c="dimmed">
                                                    {property.display.sub_label}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Group>

                                    <ScrollAreaAutosize
                                        style={{ overflowX: "auto" }}
                                    >
                                        <PropertyRenderer property={property} />
                                    </ScrollAreaAutosize>
                                </Stack>
                            </Paper>
                        )
                    )}
                </Stack>
            </Paper>
        );
    }
);
