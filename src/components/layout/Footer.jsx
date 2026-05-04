import { Box, Text, Container, Flex, Stack } from "@mantine/core";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box 
            component="footer" 
            mt={40} 
            pb="xl" 
            px="md"
        >
            <Container size="xl">
                <Flex justify="flex-end" align="center">
                    <Stack gap={2} align="flex-end">
                        <Text size="xs" color="dimmed" style={{ letterSpacing: '0.5px' }}>
                            &copy; {currentYear} <span style={{ fontWeight: 600, color: 'var(--mantine-color-blueId-9)' }}>BlueID</span> • All Rights Reserved
                        </Text>
                        <Text size="10px" color="dimmed" fw={500} style={{ opacity: 0.8 }}>
                            Powered by <span style={{ color: 'var(--mantine-color-blueId-6)' }}>Bluewhyte</span>
                        </Text>
                    </Stack>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
