import { useState } from "react";
import {
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Stack,
    Divider,
    Box,
    Center,
    useMantineTheme,
    Title
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLogin } from "@queries/auth";
import { IconMail, IconLock, IconLogin } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import BlueIDLogo from "../assets/images/blueIdLogo";

const Login = () => {
    const theme = useMantineTheme();
    const THEME_PRIMARY = theme.colors.blueId[9]; // Deeper navy to match logo
    const THEME_DARK = theme.colors.blueId[9];
    const THEME_BG = "#f8fafd"; // Very clean neutral blue background

    const form = useForm({
        initialValues: {
            username: "",
            password: "",
        },
    });

    const loginResponse = useLogin(form.values.username, form.values.password);
    const handleLogin = () => loginResponse.mutate();

    return (
        <Box 
            style={{ 
                minHeight: "100vh", 
                backgroundColor: THEME_BG,
                backgroundImage: `linear-gradient(135deg, ${theme.colors.blueId[0]} 0%, #ffffff 50%, ${theme.colors.blueId[1]} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
        >
            <Container size={420} w="100%">
                <Center mb="xl">
                    <Stack align="center" gap={0}>
                        <BlueIDLogo width={120} height={120} />
                        <Title order={1} mt={-5} style={{ color: THEME_DARK, letterSpacing: '-1px', fontSize: '2rem' }}>BlueID</Title>
                        <Text size="xs" color="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '1px' }}>Institution Management</Text>
                    </Stack>
                </Center>

                <Paper radius="lg" p={40} withBorder shadow="xl" style={{ border: `1px solid ${theme.colors.blueId[1]}`, backgroundColor: '#ffffff' }}>
                    <Box mb="xl">
                        <Title order={2} ta="center" style={{ color: THEME_DARK, fontWeight: 800 }}>Welcome Back</Title>
                        <Text color="dimmed" size="sm" ta="center" mt={4}>Securely access your administrative dashboard</Text>
                    </Box>

                    <form onSubmit={form.onSubmit(handleLogin)}>
                        <Stack gap="lg">
                            <TextInput
                                required
                                label="Administrative ID"
                                placeholder="Email or Mobile"
                                leftSection={<IconMail size={18} color={THEME_PRIMARY} />}
                                value={form.values.username}
                                onChange={(event) => form.setFieldValue("username", event.currentTarget.value)}
                                error={form.errors.username}
                                size="md"
                                radius="md"
                                styles={{
                                    label: { fontWeight: 600, color: THEME_DARK },
                                    input: { border: `1px solid ${theme.colors.blueId[1]}`, '&:focus': { borderColor: THEME_PRIMARY } }
                                }}
                            />

                            <PasswordInput
                                required
                                label="Security Credential"
                                placeholder="Enter password"
                                leftSection={<IconLock size={18} color={THEME_PRIMARY} />}
                                value={form.values.password}
                                onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
                                error={form.errors.password}
                                size="md"
                                radius="md"
                                styles={{
                                    label: { fontWeight: 600, color: THEME_DARK },
                                    input: { border: `1px solid ${theme.colors.blueId[1]}`, '&:focus': { borderColor: THEME_PRIMARY } }
                                }}
                            />

                            <Button 
                                type="submit" 
                                fullWidth 
                                size="md" 
                                radius="md"
                                mt="xl"
                                loading={loginResponse.isPending}
                                style={{ backgroundColor: THEME_PRIMARY, color: "white" }}
                                rightSection={<IconLogin size={18} color="white" />}
                            >
                                {loginResponse.isPending ? "Authenticating..." : "Authorize Login"}
                            </Button>

                            <Divider label="Session Security" labelPosition="center" my="lg" color="gray.1" />

                            <Text size="xs" ta="center" color="dimmed">
                                Problems accessing?&nbsp;
                                <Link to="/auth/forgot-password" style={{ color: THEME_PRIMARY, fontWeight: 700, textDecoration: 'none' }}>
                                    Reset Credentials
                                </Link>
                            </Text>
                        </Stack>
                    </form>
                </Paper>

                <Box mt="xl">
                    <Text ta="center" size="xs" color="dimmed" fw={500}>
                        &copy; {new Date().getFullYear()} <span style={{ fontWeight: 700, color: THEME_DARK }}>BlueID Institutions</span>
                    </Text>
                </Box>
            </Container>
        </Box>
    );
};

export default Login;
