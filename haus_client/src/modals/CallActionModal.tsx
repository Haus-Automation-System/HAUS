import {
    Badge,
    Button,
    Fieldset,
    Group,
    Paper,
    Pill,
    Stack,
    Text,
} from "@mantine/core";
import { RedactedPlugin } from "../types/plugin";
import { EntityAction } from "../types/pluginTypes/action";
import { Entity } from "../types/pluginTypes/entity";
import { NamedIcon } from "../util/NamedIcon";
import {
    IconCheck,
    IconHexagon,
    IconSettings2,
    IconX,
} from "@tabler/icons-react";
import { startCase } from "lodash";
import { useTranslation } from "react-i18next";
import { useSetState } from "@mantine/hooks";
import { GenericField } from "../components/PluginData/FieldRender";
import { modals } from "@mantine/modals";
import { useMemo } from "react";

export function CallActionModal({
    action,
    target,
    onComplete,
    entities,
}: {
    plugin: RedactedPlugin;
    action: EntityAction;
    target: Entity | null;
    onComplete: (result: any) => void;
    entities: Entity[];
}) {
    const { t } = useTranslation();
    const [form, setForm] = useSetState<{ [key: string]: any }>(
        Object.entries(action.fields).reduce(
            (prev, [key, field]) => ({ ...prev, [key]: field.default }),
            {}
        )
    );

    const validForm = useMemo(
        () =>
            !Object.values(action.fields)
                .filter((f) => f.required)
                .some(
                    (f) =>
                        form[f.key] === "" ||
                        form[f.key] === null ||
                        form[f.key] === undefined
                ),
        [action.fields, form]
    );

    return (
        <Stack gap="sm" className="call-action-modal">
            <Fieldset
                p="sm"
                className="action-info info"
                radius="sm"
                legend={t("modals.callAction.info.action.legend")}
            >
                <Group gap="sm">
                    <NamedIcon
                        icon={action.display.icon ?? "settings-2"}
                        fallback={<IconSettings2 />}
                    />
                    <Stack gap={0} className="details">
                        <Group gap="xs" align="center">
                            <Text size="sm">{action.display.label}</Text>
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
            </Fieldset>
            {target && (
                <Fieldset
                    p="sm"
                    className="target-info info"
                    radius="sm"
                    legend={t("modals.callAction.info.target.legend")}
                >
                    <Group gap="sm">
                        <NamedIcon
                            icon={target.display.icon ?? "hexagon"}
                            fallback={<IconHexagon />}
                        />
                        <Stack gap={2} className="details">
                            <Text size="sm">{target.display.label}</Text>
                            <Badge variant="light">
                                {startCase(target.type)}
                            </Badge>
                        </Stack>
                    </Group>
                </Fieldset>
            )}
            {Object.entries(action.fields).map(([key, field]) => (
                <GenericField
                    field={field}
                    key={key}
                    value={form[key]}
                    onChange={(value) => setForm({ [key]: value })}
                    entities={entities}
                />
            ))}
            <Group justify="right" gap="sm">
                <Button
                    color="red"
                    leftSection={<IconX />}
                    onClick={() => modals.closeAll()}
                >
                    {t("common.actions.cancel")}
                </Button>
                <Button
                    leftSection={<IconCheck />}
                    onClick={() => {
                        onComplete({
                            action: action.id,
                            target: target,
                            fields: form,
                        });
                        modals.closeAll();
                    }}
                    disabled={!validForm}
                >
                    {t("common.actions.submit")}
                </Button>
            </Group>
        </Stack>
    );
}
