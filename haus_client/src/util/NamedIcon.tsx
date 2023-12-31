import { TablerIconsProps } from "@tabler/icons-react";
import { camelCase, upperFirst } from "lodash";
import { ReactNode, Suspense, lazy, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

export function NamedIcon({
    icon,
    fallback,
    ...props
}: { icon: string; fallback: ReactNode } & TablerIconsProps) {
    const IconComponent = useMemo(
        () =>
            lazy(async () => {
                const imported = await import("@tabler/icons-react");
                return {
                    default: (imported as any)[
                        `Icon${upperFirst(camelCase(icon))}`
                    ],
                };
            }),
        [icon]
    );

    return (
        <ErrorBoundary fallbackRender={() => fallback}>
            <Suspense>
                <IconComponent {...props} />
            </Suspense>
        </ErrorBoundary>
    );
}
