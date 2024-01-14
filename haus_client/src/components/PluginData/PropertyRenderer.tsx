import {
    Anchor,
    Badge,
    Blockquote,
    Chip,
    ColorSwatch,
    Group,
    NumberFormatter,
    Table,
    Text,
} from "@mantine/core";
import { EntityPropertyType } from "../../types/pluginTypes/entity";
import { IconBan, IconCalendarClock } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { startCase } from "lodash";

const URL_MATCH = new RegExp(
    /^https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
);

export function PropertyRenderer({
    property,
}: {
    property: EntityPropertyType;
}) {
    const { t } = useTranslation();
    switch (property.type) {
        case "string":
            return (
                <Blockquote p="sm">
                    {URL_MATCH.test(property.value) ? (
                        <Anchor href={property.value}>{property.value}</Anchor>
                    ) : (
                        property.value
                    )}
                </Blockquote>
            );

        case "number":
            return (
                <NumberFormatter value={property.value} thousandSeparator="," />
            );

        case "boolean":
            return (
                <Badge color={property.value ? "green" : "red"} size="lg">
                    {property.value
                        ? t("common.values.boolean.true")
                        : t("common.values.boolean.false")}
                </Badge>
            );

        case "color":
            return (
                <Group gap="sm" align="center">
                    <ColorSwatch color={property.value} />
                    <Text>{property.value}</Text>
                </Group>
            );

        case "date":
            return (
                <Group gap="sm">
                    <IconCalendarClock />
                    <Text>{new Date(property.value).toLocaleString()}</Text>
                </Group>
            );

        case "list":
            if (property.value.length > 0) {
                return (
                    <Group gap="xs">
                        {property.value.map((v, i) => (
                            <Chip key={i}>{v}</Chip>
                        ))}
                    </Group>
                );
            } else {
                return (
                    <Group align="center" justify="center" gap="sm">
                        <IconBan />
                        <Text c="dimmed">
                            {t(
                                "components.pluginData.entity.property.list.noResults"
                            )}
                        </Text>
                    </Group>
                );
            }
        case "table":
            return (
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            {property.columns.map((v) => (
                                <Table.Th key={v.key}>
                                    {startCase(v.key)}
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {property.value.map((row, i) => {
                            return (
                                <Table.Tr key={i}>
                                    {property.columns.map((column) => (
                                        <Table.Td key={column.key}>
                                            {row[column.key].toString()}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            );
    }
}
