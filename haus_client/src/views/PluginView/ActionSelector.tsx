import {
    Popover,
    ActionIcon,
    Stack,
    TextInput,
    Paper,
    Group,
    Pill,
    Text,
} from "@mantine/core";
import { IconBolt, IconSearch, IconSettings2 } from "@tabler/icons-react";
import { startCase } from "lodash";
import { useMemo, useState } from "react";
import { EntityAction } from "../../types/pluginTypes/action";
import { NamedIcon } from "../../util/NamedIcon";
import { Entity } from "../../types/pluginTypes/entity";
import { RedactedPlugin } from "../../types/plugin";
import { useModals } from "../../modals";

export function ActionSelector({
    actions,
    filter,
    entity,
    plugin,
    entities,
}: {
    actions: EntityAction[];
    filter: (action: EntityAction) => boolean;
    entity?: Entity;
    plugin: RedactedPlugin;
    entities: Entity[];
}) {
    const [search, setSearch] = useState("");
    const filteredActions = useMemo(
        () =>
            actions
                .filter(filter)
                .filter(
                    (a) =>
                        search
                            .toLowerCase()
                            .includes(a.display.label.toLowerCase()) ||
                        a.display.label
                            .toLowerCase()
                            .includes(search.toLowerCase())
                ),
        [search, actions]
    );
    const { callAction } = useModals();
    const [open, setOpen] = useState(false);
    return (
        <Popover position="bottom-end" opened={open} onChange={setOpen}>
            <Popover.Target>
                <ActionIcon
                    onClick={() => setOpen(true)}
                    size="lg"
                    radius="xl"
                    variant="subtle"
                    disabled={filteredActions.length === 0}
                >
                    <IconBolt />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown className="action-dropdown" p="xs">
                <Stack gap="xs">
                    <TextInput
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(ev) => setSearch(ev.target.value)}
                    />
                    {filteredActions.map((action) => (
                        <Paper
                            className="action-item"
                            key={action.id}
                            p="xs"
                            shadow="sm"
                            onClick={() => {
                                callAction(
                                    plugin,
                                    action,
                                    entity ?? null,
                                    console.log,
                                    entities
                                );
                                setOpen(false);
                            }}
                        >
                            <Group gap="sm" wrap="nowrap">
                                <NamedIcon
                                    icon={action.display.icon ?? "settings-2"}
                                    fallback={<IconSettings2 />}
                                />
                                <Stack gap={0} className="details">
                                    <Group gap="xs" align="center">
                                        <Text size="sm">
                                            {action.display.label}
                                        </Text>
                                        <Pill size="xs" c="blue">
                                            {startCase(action.category)}
                                        </Pill>
                                    </Group>
                                    {action.display.sub_label && (
                                        <Text c="dimmed" size="xs">
                                            {action.display.sub_label}
                                        </Text>
                                    )}
                                </Stack>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
