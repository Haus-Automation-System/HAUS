import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiContext } from "../../util/api";
import { AppShell, Group, Burger, Skeleton, Text } from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import AppIcon from "../../assets/haus_icon.svg";
import { useTranslation } from "react-i18next";

export function LayoutView() {
    const nav = useNavigate();
    const { user, authenticationContext } = useApiContext();
    const [opened, { toggle }] = useDisclosure();
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    useEffect(() => {
        if (!user) {
            nav("/logged-out");
        }
    }, [user?.id, authenticationContext?.access]);

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: !opened },
            }}
            className="app-shell"
        >
            <AppShell.Header className="app-header">
                <Group h="100%" px="md" align="center">
                    <Burger opened={opened} onClick={toggle} size="sm" />
                    <img className={`app-icon ${colorScheme}`} src={AppIcon} />
                    <Text fz={24}>{t("common.appName.short")}</Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                Navbar
                {Array(15)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} h={28} mt="sm" animate={false} />
                    ))}
            </AppShell.Navbar>
            <AppShell.Main className="app-main">
                <div className="app-content"></div>
            </AppShell.Main>
        </AppShell>
    );
}
