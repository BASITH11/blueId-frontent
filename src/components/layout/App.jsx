import { Outlet } from "@tanstack/react-router";
import { AppShell, Box, Burger, ActionIcon, Group, Text, ThemeIcon, Image } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconMenu2, IconSchool } from "@tabler/icons-react";
import Navbar from "./Navbar";
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
                    backgroundColor: "#f2f4ec",
                    minHeight: "100vh",
                },
                navbar: {
                    backgroundColor: "#ffffff",
                    borderRight: "none",
                    boxShadow: "2px 0 20px rgba(0,0,0,0.02)"
                },
                header: {
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #eaf2e3",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                }
            }}
        >
            <AppShell.Header px="md">
                <Group h="100%" justify="space-between">
                    <Group>
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="md"
                            color="#192612"
                        />
                        <BlueIDLogo width={80} height={80} />
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar>
                <Navbar toggle={toggle} />
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

export default App;
