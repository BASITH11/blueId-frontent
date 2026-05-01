import { createTheme, localStorageColorSchemeManager } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "sage",
    fontFamily: "Inter, sans-serif",
    fontSizes: {
        xs: "10px",
        sm: "12px",
        md: "14px",
        lg: "16px",
        xl: "18px"
    },
    colors: {
        sage: [
            "#f1f5ed", // 0: light background tint
            "#e2eadb", // 1: borders
            "#c2d6af", // 2: secondary / light accents
            "#a2c283", // 3
            "#8db66b", // 4
            "#7c9367", // 5: PRIMARY (Olive/Sage)
            "#6b7f58", // 6
            "#5a6b4a", // 7
            "#49573c", // 8
            "#192612", // 9: DARK (Text/Heading)
        ],
    },
    components: {
        Table: {
            styles: () => ({
                th: {
                    fontWeight: "600",
                    background: "#7c9367", // sage.5
                    color: "white",
                },
            }),
        },
        Button: {
            defaultProps: {
                radius: "md",
            },
        },
        Paper: {
            defaultProps: {
                radius: "lg",
            }
        },
        Badge: {
            defaultProps: {
                radius: "xs",
            }
        }
    },
});

export const colorSchemeManager = localStorageColorSchemeManager({
    key: "color-scheme",
});

export const cssVariablesResolver = (theme) => ({
    light: {
        "--mantine-color-header": theme.colors.sage[2],
        "--mantine-color-footer": theme.colors.sage[3],
        "--mantine-color-footer-links": theme.colors.sage[9],
        "--mantine-color-table-header": theme.colors.sage[0],

        "--app-primary-color": "#7c9367",
        "--app-primary-text-color": "white",
        "--app-primary-active-color": "#192612",
        "--app-primary-background-color": "#f8faf7",
    },
    dark: {
        "--mantine-color-header": theme.colors.sage[9],
        "--mantine-color-footer": theme.colors.sage[8],
        "--mantine-color-footer-links": theme.colors.sage[2],
        "--mantine-color-table-header": theme.colors.sage[8],

        "--app-primary-color": "#7c9367",
        "--app-primary-active-color": "#c2d6af",
        "--app-primary-text-color": "#ffffff",
    },
});
