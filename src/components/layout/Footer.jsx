import {
    Anchor,
    Box,
    Group,
    Text,
    ThemeIcon,
    Image
} from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import BlueIDLogo from "../../assets/images/blueIdLogo";

export default function Footer() {
    return (
        <Box 
            p="md" 
            mt="xl" 
            style={{ 
                borderTop: "1px solid #eaf2e3", 
                backgroundColor: "transparent"
            }}
        >
            <Group justify="space-between" align="center">
                <Box>
                    <BlueIDLogo width={100} height={100} />
                </Box>

                <Box style={{ textAlign: "right" }}>
                    <Text size="xs" color="dimmed"> 
                        © {new Date().getFullYear()} All rights reserved.
                    </Text>
                </Box>
            </Group>
       </Box>
    );
}