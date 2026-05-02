import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Stack,
    Group,
    Image,
    Box,
    Checkbox,
    ThemeIcon
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEyeCheck, IconEyeOff, IconSchool, IconShieldCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useLogin } from "@queries/auth";
import BlueIDLogo from "../../assets/images/blueIdLogo";

const VisibilityToggleIcon = ({ reveal }) =>
    reveal ? <IconEyeOff size={18} color="#4a5940" /> : <IconEyeCheck size={18} color="#4a5940" />;

const Login = () => {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            username: "",
            password: "",
            remember: false
        },
    });

    const loginResponse = useLogin(form.values.username, form.values.password);
    const handleLogin = () => loginResponse.mutate();

    const inputStyles = {
        input: {
            backgroundColor: "#f2f4ec",
            border: "none",
            color: "#192612",
            height: "42px",
            borderRadius: "6px",
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
            "&:focus": {
                backgroundColor: "#e8ede0",
            }
        },
        label: {
            color: "#192612",
            fontWeight: 700,
            marginBottom: "6px",
            fontSize: "0.75rem"
        }
    };

    const curlyCurvesSvg = `
        <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#7c9367" stroke-width="2" stroke-opacity="0.35" stroke-linecap="round">
                <path d="M0 20 Q 20 0 40 20 T 80 20 M0 60 Q 20 40 40 60 T 80 60" />
                <path d="M20 0 Q 40 20 20 40 T 20 80 M60 0 Q 80 20 60 40 T 60 80" />
            </g>
        </svg>
    `;
    const curvyPatternUrl = `url("data:image/svg+xml,${encodeURIComponent(curlyCurvesSvg.trim())}")`;

    return (
        <Box 
            style={{ 
                minHeight: "100vh", 
                backgroundColor: "#7c9367", 
                padding: "1.5rem",
                display: "flex",
                fontFamily: "Inter, sans-serif"
            }}
        >
            <style>
                {`
                @keyframes curlyDrift {
                    0% { background-position: 0px 0px; }
                    100% { background-position: -80px -80px; }
                }
                `}
            </style>
            <Box 
                style={{ 
                    flex: 1,
                    backgroundColor: "#c2d6af", 
                    borderRadius: "24px",
                    overflow: "hidden",
                    position: "relative",
                    backgroundImage: curvyPatternUrl,
                    backgroundSize: "80px 80px",
                    animation: "curlyDrift 30s linear infinite",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center"
                }}
            >
                {/* Left Side Branding */}
                <Box 
                    style={{ 
                        flex: "1 1 50%", 
                        padding: "3rem 6%", 
                        display: "flex", 
                        flexDirection: "column",
                        justifyContent: "center",
                        minWidth: "320px"
                    }}
                >
                    <Box mb={40}>
                        <BlueIDLogo width={300} height={300} />
                    </Box>

                    <Text 
                        style={{ 
                            fontFamily: "Georgia, 'Times New Roman', serif", 
                            fontSize: "clamp(2.5rem, 4vw, 4.5rem)", 
                            fontWeight: 400, 
                            lineHeight: 1.1,
                            color: "#192612",
                            marginBottom: "1.5rem"
                        }}
                    >
                        Secure Access,<br />Managed Results.
                    </Text>

                    <Text 
                        style={{ 
                            color: "#384729", 
                            fontSize: "0.95rem", 
                            lineHeight: 1.5,
                            maxWidth: "400px",
                            marginBottom: "2.5rem"
                        }}
                    >
                        Advanced student data management for professional educational institutions. Login to access your secure administrative dashboard.
                    </Text>

                    <Group gap="sm">
                        <Button 
                            variant="white" 
                            radius="xl" 
                            leftSection={<IconShieldCheck size={16} />}
                            style={{ 
                                color: "#192612", 
                                fontSize: "0.75rem", 
                                letterSpacing: "1px", 
                                fontWeight: 700,
                                padding: "0 1.25rem",
                                height: "38px",
                                backgroundColor: "white",
                                transition: "all 0.2s"
                            }}
                        >
                            SECURE LOGIN
                        </Button>
                    </Group>
                </Box>

                {/* Right Side Form */}
                <Box 
                    style={{ 
                        flex: "1 1 40%", 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center",
                        padding: "2rem",
                        minWidth: "350px"
                    }}
                >
                    <Paper
                        radius="lg"
                        p={{ base: 30, sm: 40 }}
                        style={{
                            backgroundColor: "#ffffff",
                            width: "100%",
                            maxWidth: "420px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                            borderRadius: "20px"
                        }}
                    >
                        <Text 
                            style={{ 
                                fontFamily: "Georgia, 'Times New Roman', serif",
                                fontSize: "1.75rem",
                                color: "#192612",
                                marginBottom: "2rem"
                            }}
                        >
                            Sign in to Portal
                        </Text>

                        <form onSubmit={form.onSubmit(handleLogin)}>
                            <Stack gap={16}>
                                <TextInput
                                    required
                                    label="Email or Mobile Number"
                                    placeholder="Enter your email or mobile"
                                    value={form.values.username}
                                    onChange={(event) => form.setFieldValue("username", event.currentTarget.value)}
                                    error={form.errors.username}
                                    styles={inputStyles}
                                />

                                <PasswordInput
                                    required
                                    label="Password"
                                    placeholder="••••••••••••"
                                    value={form.values.password}
                                    onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
                                    error={form.errors.password}
                                    visibilityToggleIcon={VisibilityToggleIcon}
                                    styles={inputStyles}
                                />

                                <Checkbox
                                    label="Remember me"
                                    checked={form.values.remember}
                                    onChange={(event) => form.setFieldValue("remember", event.currentTarget.checked)}
                                    styles={{
                                        label: { color: "#384729", fontSize: "0.85rem" },
                                        input: { borderColor: "#c2d6af", backgroundColor: "transparent" }
                                    }}
                                    mt={4}
                                    mb={12}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={loginResponse.isPending || loginResponse.isLoading}
                                    loading={loginResponse.isPending || loginResponse.isLoading}
                                    style={{
                                        height: "44px",
                                        backgroundColor: "#bed4af", 
                                        color: "#192612",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        letterSpacing: "1px",
                                        borderRadius: "6px",
                                        transition: "background-color 0.2s"
                                    }}
                                >
                                    LOG IN
                                </Button>

                                <Box mt="md" ta="center">
                                    <Link
                                        to="/auth/forgot-password"
                                        style={{
                                            color: "#192612",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            letterSpacing: "0.5px",
                                            textDecoration: "none",
                                        }}
                                    >
                                        FORGOT YOUR PASSWORD?
                                    </Link>
                                </Box>
                            </Stack>
                        </form>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;