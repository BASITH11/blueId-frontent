import { Outlet } from "@tanstack/react-router";
import { AppShell, Box, Burger, ActionIcon, Group, Text, ThemeIcon, Image } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconMenu2, IconSchool } from "@tabler/icons-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BlueIDLogo from "../../assets/images/blueIdLogo";

const App = () => {
    const [opened, { toggle }] = useDisclosure();
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <AppShell
            header={{ height: 100, collapsed: !isMobile }}
            navbar={{
                width: 280,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding={{ base: "md", sm: "xl" }}
            withBorder={false}
            styles={{
                main: {
                    backgroundColor: "#f5f8ff",
                    minHeight: "100vh",
                },
                navbar: {
                    backgroundColor: "#ffffff",
                    borderRight: "none",
                    boxShadow: "2px 0 20px rgba(0,0,0,0.02)"
                },
                header: {
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e3eaf2",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                }
            }}
        >
            <AppShell.Header px="md">
                <Group h="100%" justify="space-between">
                    <BlueIDLogo width={80} height={80} />
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="md"
                        color="#0E2348"
                    />
                </Group>
            </AppShell.Header>

            <AppShell.Navbar>
                <Navbar toggle={toggle} />
            </AppShell.Navbar>

            <AppShell.Main>
                <Box style={{ minHeight: 'calc(100vh - 140px)' }}>
                    <Outlet />
                </Box>
                <Footer />
            </AppShell.Main>
        </AppShell>
    );
};

export default App;
