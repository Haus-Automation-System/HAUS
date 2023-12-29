import { Paper, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import AppLogo from "../../assets/haus_logo.png";
import { useColorScheme } from "@mantine/hooks";

export function Greeter() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    return (
        <Stack gap="sm" className="greeter-container">
            <Paper className="greeter-box logo" radius="sm" p="sm" shadow="sm">
                <Stack gap="sm" align="center" justify="center">
                    <img src={AppLogo} className={`app-logo ${colorScheme}`} />
                </Stack>
            </Paper>
            <Paper className="greeter-box form" radius="sm" p="sm" shadow="sm">
                {t("views.greeter.login.title")}
            </Paper>
        </Stack>
    );
}
