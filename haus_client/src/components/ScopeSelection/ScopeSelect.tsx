import { useUncontrolled } from "@mantine/hooks";
import { User } from "../../types/auth";
import { useApi, useEvent } from "../../util/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApplicationScopes, ScopeDefinition } from "../../types/scope";
import {
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

function suggest(
    current: ApplicationScopes,
    scope: string,
    path?: string,
    parent?: ScopeDefinition
): { def: ScopeDefinition; path: string }[] {
    if (!scope.includes(".")) {
        return parent
            ? [
                  {
                      def: parent,
                      path: path ?? "",
                  },
                  ...Object.values(current).map((def) => ({
                      def,
                      path: (path ? path + "." : "") + def.name,
                  })),
              ]
            : Object.values(current).map((def) => ({
                  def,
                  path: (path ? path + "." : "") + def.name,
              }));
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
        return suggestions.map(({ def, path }) => (
            <MenuItem
                onClick={() => {
                    if (!_value.includes(path)) {
                        handleChange([..._value, path]);
                        setSearch("");
                    }
                }}
                key={path}
                disabled={_value.includes(path) || path === "root"}
            >
                <Stack gap={0}>
                    <Text>
                        {def.friendly_name} ({path})
                    </Text>
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
        >
            <Menu.Target>
                <PillsInput {...props}>
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
