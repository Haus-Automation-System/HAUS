import { useUncontrolled } from "@mantine/hooks";
import { User } from "../../types/auth";
import { hasScope, useApi, useEvent } from "../../util/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApplicationScopes, ScopeDefinition } from "../../types/scope";
import {
    Group,
    Menu,
    MenuDropdown,
    MenuItem,
    Pill,
    PillsInput,
    PillsInputField,
    PillsInputProps,
    Stack,
    Text,
} from "@mantine/core";
import { IconCaretDown, IconCheck } from "@tabler/icons-react";

function suggest(
    current: ApplicationScopes,
    scope: string,
    path?: string,
    parent?: ScopeDefinition
): { def: ScopeDefinition; path: string; type: "child" | "leaf" }[] {
    if (!scope.includes(".")) {
        return parent
            ? [
                  {
                      def: parent,
                      path: path ?? "",
                      type: "leaf",
                  },
                  ...Object.values(current).map((def) => ({
                      def,
                      path: (path ? path + "." : "") + def.name,
                      type:
                          Object.keys(def.children).length > 0
                              ? "child"
                              : "leaf",
                  })),
              ]
            : (Object.values(current).map((def) => ({
                  def,
                  path: (path ? path + "." : "") + def.name,
                  type: Object.keys(def.children).length > 0 ? "child" : "leaf",
              })) as any);
    }
    const pieces = scope.split(".");
    const head = pieces[0];
    const tail = pieces.slice(1).join(".");
    if (!current[head]) {
        return [];
    }

    return suggest(
        current[head].children,
        tail,
        (path ? path + "." : "") + head,
        current[head]
    );
}

export function ScopeSelect({
    value,
    defaultValue,
    onChange,
    user,
    ...props
}: {
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    user?: User;
} & Omit<PillsInputProps, "value" | "defaultValue" | "onChange">) {
    const [_value, handleChange] = useUncontrolled({
        value,
        defaultValue,
        finalValue: [],
        onChange,
    });

    const { scopes } = useApi();
    const [appScopes, setAppScopes] = useState<ApplicationScopes>({});

    const loadScopes = useCallback(
        () => scopes().then(setAppScopes),
        [scopes, setAppScopes]
    );
    useEvent("plugins", () => loadScopes);

    useEffect(() => {
        loadScopes();
    }, []);

    const [search, setSearch] = useState<string>("");

    const items = useMemo(() => {
        const suggestions = suggest(appScopes, search);
        return suggestions
            .filter(({ path }) => !(_value.includes(path) || path === "root"))
            .map(({ def, path, type }) => (
                <MenuItem
                    onClick={() => {
                        if (type === "leaf") {
                            if (!_value.includes(path)) {
                                handleChange([..._value, path]);
                                setSearch("");
                            }
                        } else {
                            setSearch(path + ".");
                        }
                    }}
                    key={path}
                    disabled={type === "leaf" && user && !hasScope(user, path)}
                >
                    <Stack gap={0}>
                        <Group gap="sm">
                            {type === "child" ? (
                                <IconCaretDown />
                            ) : (
                                <IconCheck />
                            )}
                            <Text>
                                {def.friendly_name} ({path})
                            </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {def.description}
                        </Text>
                    </Stack>
                </MenuItem>
            ));
    }, [search, appScopes]);

    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <Menu
            width={400}
            opened={menuOpen}
            onClose={() => setMenuOpen(false)}
            trapFocus={false}
            position="bottom-start"
            closeOnItemClick={false}
        >
            <Menu.Target>
                <PillsInput
                    {...props}
                    onClick={() => !menuOpen && setMenuOpen(true)}
                >
                    <Pill.Group>
                        {_value.map((v) => (
                            <Pill
                                key={v}
                                withRemoveButton
                                onRemove={() =>
                                    handleChange(_value.filter((i) => i !== v))
                                }
                            >
                                {v}
                            </Pill>
                        ))}
                    </Pill.Group>
                    <PillsInputField
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setMenuOpen(true);
                        }}
                        value={search}
                    />
                </PillsInput>
            </Menu.Target>
            <MenuDropdown>{items}</MenuDropdown>
        </Menu>
    );
}
