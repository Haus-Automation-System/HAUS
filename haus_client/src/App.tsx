import { RouterProvider } from "react-router-dom";
import "./styles/index.scss";
import { MantineProvider } from "@mantine/core";
import { AppRouter } from "./routes";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as langEn from "./lang/en.json";
import { ApiProvider } from "./util/api";
import { Notifications } from "@mantine/notifications";

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        // the translations
        // (tip move them in a JSON file and import them,
        // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
        resources: {
            en: {
                translation: langEn,
            },
        },
        lng: "en", // if you're using a language detector, do not define the lng option
        fallbackLng: "en",

        interpolation: {
            escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        },
    });

function App() {
    return (
        <MantineProvider defaultColorScheme="dark">
            <Notifications />
            <ApiProvider>
                <div className="app">
                    <RouterProvider router={AppRouter} />
                </div>
            </ApiProvider>
        </MantineProvider>
    );
}

export default App;
