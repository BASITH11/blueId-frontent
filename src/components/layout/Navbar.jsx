import React from "react";
import { NavLink, Stack, Box, Text, Image, ScrollArea, Badge, Group, useMantineTheme, ThemeIcon } from "@mantine/core";
import {
    IconHome2,
    IconUserPlus,
    IconShieldLock,
    IconDeviceDesktop,
    IconUsers,
    IconChartBar,
    IconMapPin,
    IconFolders,
    IconCalendarTime,
    IconClock24,
    IconMessage,
    IconLogout,
    IconBuildingStore,
    IconSettings,
    IconSchool,
    IconFileExport,
    IconFileUpload
} from "@tabler/icons-react";
import { useLogout } from "../../queries/auth";
import { useRouterState, Link } from "@tanstack/react-router";
import { useAuthStore } from "../../config/authStore";
import BlueIDLogo from "../../assets/images/blueIdLogo";

export default function Sidebar({ toggle }) {
    const theme = useMantineTheme();
    const { location } = useRouterState();
    const currentPath = location.pathname;
    const logout = useLogout();
    const { role } = useAuthStore();
    
    const handleLogout = () => logout.mutate();

    const isSchoolAdmin = (role?.name || role)?.toString()?.toLowerCase() === 'school_admin';

    const allMenuItems = [
        { label: "Dashboard", to: "/dashboard", icon: IconHome2 },
        { label: "Manage Admins", to: "/manage-admins", icon: IconShieldLock, superAdminOnly: true },
        { label: "Manage Students", to: "/manage-students", icon: IconUsers },
        { label: "Export Template", to: "/export-template", icon: IconFileExport },
        { label: "Import Students", to: "/import-students", icon: IconFileUpload },
        { label: "Register Admin", to: "/register-admin", icon: IconUserPlus, superAdminOnly: true },
        { label: "Manage Roles", to: "/manage-roles", icon: IconShieldLock, superAdminOnly: true },
        { label: "Manage Batches", to: "/manage-batches", icon: IconFolders, superAdminOnly: true },
        { 
            label: isSchoolAdmin ? "Manage Institution" : "Manage Schools", 
            to: isSchoolAdmin ? "/my-school" : "/manage-schools", 
            icon: IconBuildingStore 
        }
    ];

    const menuItems = isSchoolAdmin 
        ? allMenuItems.filter(item => !item.superAdminOnly) 
        : allMenuItems;

    const THEME_PRIMARY = theme.colors.sage[5];
    const THEME_LIGHT = theme.colors.sage[2];
    const THEME_DARK = theme.colors.sage[9];

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#ffffff" }}>
            <Box p="md" mb="md" style={{ display: 'flex', justifyContent: 'center' }}>
                <BlueIDLogo width={180} height={180} />
            </Box>

            <ScrollArea style={{ flex: 1 }} px="lg">
                <Stack gap={8}>
                    {menuItems.map((link) => {
                        const isActive = currentPath === link.to || (link.to !== "/" && currentPath.startsWith(link.to));
                        return (
                            <NavLink
                                key={link.label}
                                component={Link}
                                to={link.to}
                                label={
                                    <Text fw={600} size="sm" color={isActive ? THEME_DARK : "#5d6b54"}>
                                        {link.label}
                                    </Text>
                                }
                                leftSection={<link.icon size={20} color={isActive ? THEME_PRIMARY : "#5d6b54"} stroke={isActive ? 2.5 : 1.5} />}
                                rightSection={
                                    link.badge ? (
                                        <Badge variant="light" color="sage" size="sm" style={{ fontWeight: 700 }}>
                                            {link.badge}
                                        </Badge>
                                    ) : null
                                }
                                active={isActive}
                                onClick={toggle}
                                styles={{
                                    root: {
                                        borderRadius: "12px",
                                        padding: "10px 16px",
                                        backgroundColor: isActive ? `${THEME_LIGHT}33` : "transparent",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            backgroundColor: isActive ? `${THEME_LIGHT}44` : theme.colors.sage[0]
                                        }
                                    }
                                }}
                            />
                        );
                    })}
                </Stack>
            </ScrollArea>

            <Box p="lg" mt="auto" style={{ borderTop: "1px solid #f4f6f0" }}>
                <NavLink
                    label={<Text fw={600} size="sm" color="#fa5252">Sign Out</Text>}
                    leftSection={<IconLogout size={20} color="#fa5252" />}
                    onClick={handleLogout}
                    styles={{
                        root: {
                            borderRadius: "12px",
                            padding: "10px 16px",
                            "&:hover": { backgroundColor: "#fff5f5" }
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
