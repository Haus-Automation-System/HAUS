import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiContext } from "../../util/api";

export function LayoutView() {
    const nav = useNavigate();
    const { user, authenticationContext } = useApiContext();

    useEffect(() => {
        if (!user) {
            nav("/logged-out");
        }
    }, [user?.id, authenticationContext?.access]);

    return <div></div>;
}
