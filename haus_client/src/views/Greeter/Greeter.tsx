import { Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import AppLogo from "../../assets/haus_logo.png";
import { useColorScheme } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
    IconCheck,
    IconLogin2,
    IconPassword,
    IconUserFilled,
} from "@tabler/icons-react";

export function Greeter() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
        validate: {
            username: (value) =>
                value.length > 0 ? null : t("common.errors.requiredField"),
            password: (value) =>
                value.length > 0 ? null : t("common.errors.requiredField"),
        },
    });
    return (
        <Stack gap="sm" className="greeter-container">
            <Paper className="greeter-box logo" radius="sm" p="sm" shadow="sm">
                <Stack gap="sm" align="center" justify="center">
                    <img src={AppLogo} className={`app-logo ${colorScheme}`} />
                </Stack>
            </Paper>
            <Paper className="greeter-box form" radius="sm" p="sm" shadow="sm">
                <form
                    onSubmit={form.onSubmit(({ username, password }) =>
                        console.log(username, password)
                    )}
                >
                    <Stack gap="sm">
                        <Group justify="space-between" gap="sm">
                            <IconLogin2 size={28} />
                            <Text size="xl">{t("views.greeter.title")}</Text>
                        </Group>

                        <TextInput
                            withAsterisk
                            leftSection={<IconUserFilled size={16} />}
                            label={t("views.greeter.fields.username.label")}
                            {...form.getInputProps("username")}
                        />
                        <TextInput
                            withAsterisk
                            leftSection={<IconPassword size={16} />}
                            label={t("views.greeter.fields.password.label")}
                            {...form.getInputProps("password")}
                        />
                        <Group justify="right">
                            <Button
                                leftSection={<IconCheck size={24} />}
                                type="submit"
                            >
                                {t("views.greeter.submit")}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
}
