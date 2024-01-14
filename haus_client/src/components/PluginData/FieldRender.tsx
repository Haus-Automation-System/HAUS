import {
    ActionIcon,
    Badge,
    ColorInput,
    Group,
    Input,
    JsonInput,
    MultiSelect,
    NumberInput,
    Paper,
    Popover,
    Select,
    Space,
    Stack,
    Switch,
    Text,
    TextInput,
} from "@mantine/core";
import {
    ActionFieldType,
    EntitySelectorActionField,
} from "../../types/pluginTypes/action";
import { NamedIcon } from "../../util/NamedIcon";
import { DateInput, DateTimePicker, TimeInput } from "@mantine/dates";
import { isNumber, startCase } from "lodash";
import { Entity } from "../../types/pluginTypes/entity";
import {
    IconBan,
    IconChevronDown,
    IconHexagon,
    IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

function EntitySelector({
    field,
    value,
    onChange,
    entities,
}: {
    field: EntitySelectorActionField;
    value: string | null;
    onChange: (value: string | null) => void;
    entities: Entity[];
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const filteredEntities = entities.filter(
        (e) =>
            (field.prefix &&
                field.prefix.length > 0 &&
                field.prefix.some((i) => e.id.startsWith(i))) ||
            !field.prefix ||
            field.prefix.length === 0
    );

    const entity = value ? entities.find((e) => e.id === value) ?? null : null;

    return (
        <Popover
            position="bottom-end"
            opened={open}
            onClose={() => setOpen(false)}
            closeOnClickOutside
            closeOnEscape
        >
            <Popover.Target>
                <Input.Wrapper
                    label={field.display.label}
                    description={field.display.sub_label}
                    withAsterisk={field.required}
                    onClick={() => setOpen(!open)}
                    style={{ cursor: "pointer" }}
                >
                    <Space h={4} />
                    <Paper
                        withBorder
                        radius="sm"
                        p="sm"
                        className="entity-selector-target"
                    >
                        <Group justify="space-between" align="center">
                            {entity ? (
                                <Group gap="sm">
                                    <NamedIcon
                                        icon={entity.display.icon ?? "hexagon"}
                                        fallback={<IconHexagon />}
                                    />
                                    <Stack gap={2} className="details">
                                        <Text size="sm">
                                            {entity.display.label}
                                        </Text>
                                        <Badge variant="light">
                                            {startCase(entity.type)}
                                        </Badge>
                                    </Stack>
                                </Group>
                            ) : (
                                <Group gap="sm">
                                    <IconBan size={20} />
                                    <Text size="sm">
                                        {t("common.values.empty")}
                                    </Text>
                                </Group>
                            )}
                            <Group gap="sm">
                                {value && (
                                    <ActionIcon
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            onChange(null);
                                        }}
                                        variant="subtle"
                                        radius="xl"
                                        color="red"
                                    >
                                        <IconX size={20} />
                                    </ActionIcon>
                                )}
                                <ActionIcon variant="subtle" radius="xl">
                                    <IconChevronDown size={20} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Paper>
                </Input.Wrapper>
            </Popover.Target>
            <Popover.Dropdown className="entity-selector-dropdown" p="xs">
                {filteredEntities.length > 0 ? (
                    <Stack gap="sm">
                        {filteredEntities.map((entity) => (
                            <Paper
                                key={entity.id}
                                p="sm"
                                radius="sm"
                                className="entity-item"
                                onClick={() => {
                                    setOpen(false);
                                    onChange(entity.id);
                                }}
                            >
                                <Group gap="sm">
                                    <NamedIcon
                                        icon={entity.display.icon ?? "hexagon"}
                                        fallback={<IconHexagon />}
                                    />
                                    <Stack gap={2} className="details">
                                        <Text size="sm">
                                            {entity.display.label}
                                        </Text>
                                        <Badge variant="light">
                                            {startCase(entity.type)}
                                        </Badge>
                                    </Stack>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Group align="center" justify="center" gap="sm">
                        <IconBan />
                        <Text c="dimmed">
                            {t(
                                "components.pluginData.entity.property.list.noResults"
                            )}
                        </Text>
                    </Group>
                )}
            </Popover.Dropdown>
        </Popover>
    );
}

export function GenericField({
    field,
    value,
    onChange,
    entities,
}: {
    field: ActionFieldType;
    value: any;
    onChange: (value: any) => void;
    entities: Entity[];
}) {
    switch (field.type) {
        case "boolean":
            return (
                <Switch
                    label={field.display.label}
                    description={field.display.sub_label}
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                />
            );
        case "color":
            return (
                <ColorInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    format="rgb"
                    value={
                        value
                            ? `rgb(${value
                                  .map((i: number) => i.toString())
                                  .join(", ")})`
                            : ""
                    }
                    onChange={(value) =>
                        onChange(
                            value
                                .split("(")[1]
                                .split(")")[0]
                                .split(",")
                                .map((i) => Number(i.trim()))
                        )
                    }
                    withAsterisk={field.required}
                />
            );
        case "date":
            return (
                <DateInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ? new Date(value) : null}
                    onChange={(newValue) =>
                        newValue ? newValue.toISOString() : null
                    }
                    minDate={field.min ? new Date(field.min) : undefined}
                    maxDate={field.max ? new Date(field.max) : undefined}
                    withAsterisk={field.required}
                />
            );

        case "datetime":
            return (
                <DateTimePicker
                    label={field.display.label}
                    description={field.display.sub_label}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ? new Date(value) : null}
                    onChange={(newValue) =>
                        newValue ? newValue.toISOString() : null
                    }
                    minDate={field.min ? new Date(field.min) : undefined}
                    maxDate={field.max ? new Date(field.max) : undefined}
                    withAsterisk={field.required}
                />
            );
        case "json":
            return (
                <JsonInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ?? ""}
                    onChange={onChange}
                    minRows={2}
                    autosize
                    formatOnBlur
                    withAsterisk={field.required}
                />
            );
        case "number":
            return (
                <NumberInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ?? 0}
                    onChange={(value) =>
                        isNumber(value) ? onChange(value) : onChange(0)
                    }
                    min={field.min}
                    max={field.max}
                    allowDecimal={field.decimals}
                    suffix={field.unit ? " " + field.unit : undefined}
                    withAsterisk={field.required}
                />
            );
        case "selection":
            if (field.multi) {
                return (
                    <MultiSelect
                        label={field.display.label}
                        description={field.display.sub_label}
                        placeholder={field.example}
                        leftSection={
                            field.display.icon && (
                                <NamedIcon
                                    icon={field.display.icon}
                                    fallback={undefined}
                                />
                            )
                        }
                        data={field.options}
                        value={value ?? []}
                        clearable
                        onChange={onChange}
                        withAsterisk={field.required}
                    />
                );
            } else {
                return (
                    <Select
                        label={field.display.label}
                        description={field.display.sub_label}
                        placeholder={field.example}
                        leftSection={
                            field.display.icon && (
                                <NamedIcon
                                    icon={field.display.icon}
                                    fallback={undefined}
                                />
                            )
                        }
                        data={field.options}
                        value={value ?? null}
                        clearable
                        onChange={onChange}
                        withAsterisk={field.required}
                    />
                );
            }
        case "string":
            return (
                <TextInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    withAsterisk={field.required}
                />
            );
        case "time":
            return (
                <TimeInput
                    label={field.display.label}
                    description={field.display.sub_label}
                    placeholder={field.example}
                    leftSection={
                        field.display.icon && (
                            <NamedIcon
                                icon={field.display.icon}
                                fallback={undefined}
                            />
                        )
                    }
                    value={value ?? ""}
                    onChange={onChange}
                    min={field.min ?? undefined}
                    max={field.max ?? undefined}
                    withAsterisk={field.required}
                />
            );
        case "entity":
            return (
                <EntitySelector
                    field={field}
                    value={value}
                    onChange={onChange}
                    entities={entities}
                />
            );
    }
}
