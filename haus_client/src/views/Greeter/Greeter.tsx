import {
    Button,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
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
import { useApi, useUser } from "../../util/api";
import { useNotifications } from "../../util/notifications";
import { isApiError } from "../../util/api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
    const api = useApi();
    const user = useUser();
    const { success, error } = useNotifications();
    const nav = useNavigate();

    useEffect(() => {
        if (user) {
            nav("/");
        }
    }, [user?.id]);

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
                        api.users.auth
                            .login(username, password)
                            .then((result) => {
                                if (isApiError(result)) {
                                    error(result);
                                } else {
                                    success(
                                        t("views.greeter.feedback.success")
                                    );
                                    nav("/");
                                }
                            })
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
                        <PasswordInput
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
