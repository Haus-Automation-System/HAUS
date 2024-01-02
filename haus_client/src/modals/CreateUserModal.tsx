import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconPassword,
    IconShield,
    IconUserEdit,
    IconUserPlus,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ScopeSelect } from "../components/ScopeSelection/ScopeSelect";
import { isApiError, useApi, useUser } from "../util/api";
import { useNotifications } from "../util/notifications";
import { modals } from "@mantine/modals";

export function CreateUserModal() {
    const form = useForm<{
        username: string;
        password: string;
        scopes: string[];
    }>({
        initialValues: {
            username: "",
            password: "",
            scopes: ["app.user", "app.plugins"],
        },
        validate: {
            username: (value) =>
                value.length === 0 ? t("common.errors.requiredField") : null,
            password: (value) =>
                value.length === 0 ? t("common.errors.requiredField") : null,
        },
    });
    const { t } = useTranslation();
    const api = useApi();
    const user = useUser();
    const { error, success } = useNotifications();
    return (
        <form
            onSubmit={form.onSubmit((values) =>
                api.users.admin
                    .create(values.username, values.password, values.scopes)
                    .then((result) => {
                        if (isApiError(result)) {
                            error(result);
                        } else {
                            success(t("modals.createUser.success"));
                            modals.closeAll();
                        }
                    })
            )}
        >
            <Stack gap="sm">
                <TextInput
                    leftSection={<IconUserEdit size={16} />}
                    label={t("modals.createUser.fields.username.label")}
                    withAsterisk
                    placeholder={t(
                        "modals.createUser.fields.username.placeholder"
                    )}
                    {...form.getInputProps("username")}
                />
                <PasswordInput
                    leftSection={<IconPassword size={16} />}
                    label={t("modals.createUser.fields.password.label")}
                    withAsterisk
                    placeholder={t(
                        "modals.createUser.fields.password.placeholder"
                    )}
                    {...form.getInputProps("password")}
                />
                <ScopeSelect
                    {...form.getInputProps("scopes")}
                    label={t("modals.createUser.fields.scopes.label")}
                    leftSection={<IconShield size={16} />}
                    user={user ?? undefined}
                />
                <Group justify="right">
                    <Button leftSection={<IconUserPlus />} type="submit">
                        {t("modals.createUser.submit")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
