import { createTheme, localStorageColorSchemeManager } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "blueId",
    fontFamily: "Inter, sans-serif",
    fontSizes: {
        xs: "10px",
        sm: "12px",
        md: "14px",
        lg: "16px",
        xl: "18px"
    },
    colors: {
        blueId: [
            "#e8f1ff", // 0: light background tint
            "#d0e1ff", // 1: borders
            "#a1c5ff", // 2: secondary / light accents
            "#70a6ff", // 3
            "#4d8fff", // 4
            "#337cff", // 5
            "#1c69ff", // 6
            "#0364EF", // 7: PRIMARY (BlueID Blue)
            "#0050c7", // 8
            "#0E2348", // 9: DARK (Text/Heading/Deep Blue)
        ],
    },
    components: {
        Table: {
            styles: (theme) => ({
                th: {
                    fontWeight: "600",
                    background: "#0364EF", // blueId.7
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
        "--mantine-color-header": theme.colors.blueId[2],
        "--mantine-color-footer": theme.colors.blueId[3],
        "--mantine-color-footer-links": theme.colors.blueId[9],
        "--mantine-color-table-header": theme.colors.blueId[0],

        "--app-primary-color": "#0364EF",
        "--app-primary-text-color": "white",
        "--app-primary-active-color": "#0E2348",
        "--app-primary-background-color": "#f8faff",
    },
    dark: {
        "--mantine-color-header": theme.colors.blueId[9],
        "--mantine-color-footer": theme.colors.blueId[8],
        "--mantine-color-footer-links": theme.colors.blueId[2],
        "--mantine-color-table-header": theme.colors.blueId[8],

        "--app-primary-color": "#0364EF",
        "--app-primary-active-color": "#a1c5ff",
        "--app-primary-text-color": "#ffffff",
    },
});
