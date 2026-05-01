import { ActionIcon, Box, Burger, Flex, Menu, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPower, IconSettings, IconX } from "@tabler/icons-react";
import { useAuthStore } from "../../config/authStore";
import { useLogout } from "../../queries/auth";

export default function Header({ toggle, opened }) {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const logout = useLogout();
    const authenticatedUser = useAuthStore.getState();
    const handleLogout = () => logout.mutate();

    return (
        <Flex
            h="100%"
            px="xl"
            align="center"
            justify="space-between"
            style={{ backgroundColor: "transparent" }}
        >
            <Flex align="center" gap="md">
                {opened ? (
                    <ActionIcon size="lg" hiddenFrom="md" variant="subtle" onClick={toggle}>
                        <IconX size={24} stroke={2.5} color={theme.colors.gray[7]} />
                    </ActionIcon>
                ) : (
                    <Burger size="sm" hiddenFrom="sm" opened={opened} onClick={toggle} color={theme.colors.gray[7]} />
                )}
            </Flex>

            {/* Profile */}
            <Flex gap="xl" align="center" style={{ flexShrink: 0 }}>
                <Menu shadow="sm" width={200} position="bottom-end" withArrow>
                    <Menu.Target>
                        <Flex align="center" gap="md" className="cursor-pointer">
                            {!isMobile && (
                                <Text size="sm" fw={600} color="#192612">
                                    {authenticatedUser.user?.name || "Admin"}
                                </Text>
                            )}
                            <Box
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    backgroundColor: "#dcdfd6",
                                    color: "#192612",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    overflow: "hidden",
                                    border: "2px solid #ffffff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                }}
                            >
                                {authenticatedUser.user?.name?.charAt(0) || "A"}
                            </Box>
                        </Flex>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Account</Menu.Label>
                        <Menu.Item leftSection={<IconSettings size={18} />}>Settings</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item color="red" leftSection={<IconPower size={18} />} onClick={handleLogout}>
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Flex>
        </Flex>
    );
}
