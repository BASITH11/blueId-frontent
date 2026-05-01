import { useState } from "react";
import {
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Flex,
    Stack,
    Divider,
    Select,
    Box,
    Image,
} from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { useForm } from "@mantine/form";
import { useLogin } from "@queries/auth";
import { IconEyeCheck, IconEyeOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import User from '../assets/images/dummy-user.jpg';



const VisibilityToggleIcon = ({ reveal }) => reveal ? <IconEyeOff style={{ fontSize: '8px' }} /> : <IconEyeCheck style={{ fontSize: '8px' }} />;     


const Login = (props) => {

    const [stage, setStage] = useState("login");
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            email: "",
            password: "",
        },
    });

    const loginResponse = useLogin(form.values.email, form.values.password);
    const handleLogin = () => loginResponse.mutate();
    


    return (
        <div className="min-h-[80vh] md:min-h-[80vh] flex items-center">
            <Container className="w-full h-full flex justify-center">
                <Paper radius="md" p="lg" className="w-full md:w-[55%]" >
            <Text size="xl" fw={800} align="center" mb="lg" >
                {("login").toUpperCase()}
            </Text>

            <form onSubmit={form.onSubmit(handleLogin)}>
                <Stack gap={30}>
                    <TextInput
                        required
                        label="Email"
                        placeholder="Enter your Email"
                        value={form.values.email}
                        onChange={(event) =>
                            form.setFieldValue(
                                "email",
                                event.currentTarget.value
                            )
                        }
                        error={form.errors.email}
                        radius={0}
                        size="md"
                        className={{

                        }}
                    />

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Enter your password"
                        value={form.values.password}
                        onChange={(event) =>
                            form.setFieldValue(
                                "password",
                                event.currentTarget.value
                            )
                        }
                        error={form.errors.password}
                        radius={0}
                        size="md"
                        visibilityToggleIcon={VisibilityToggleIcon}
                    />
                    <Stack justify="center" gap={15}>
                        <Button type="submit" variant="filled" fullWidth color="var(--app-primary-color)" loading={false}>
                            {loginResponse.isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <Divider label="Or" labelPosition="center" />
                        <Text size="sm" ta="center">
                            Forgot your credentials&nbsp;?&nbsp;&nbsp;
                            <Link to="/auth/forgot-password" className="text-blue-700">
                                Click here to reset.
                            </Link>
                        </Text>


                    </Stack>
                </Stack>
            </form>
        </Paper>

            </Container>
        </div>
    );
};

export default Login;
