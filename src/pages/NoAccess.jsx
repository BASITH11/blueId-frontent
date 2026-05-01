// src/pages/NotAccessPage.jsx
import { Paper, Title, Text, Button, Container, Flex, Box } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { IconLock, IconArrowLeft, IconHome } from "@tabler/icons-react";

const NoAccess = () => {
  const navigate = useNavigate();

  return (
    <Container size="sm" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper 
        p="xl" 
        radius="lg"
        style={{ 
          width: "100%",
          textAlign: "center",
          backgroundColor: "var(--app-primary-background-color)",
        }}
      >
        {/* Icon Section */}
        <Flex justify="center" mb="lg">
          <Box
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              borderRadius: "50%",
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <IconLock size={48} color="white" />
          </Box>
        </Flex>

        {/* Content Section */}
        <Title 
          order={1} 
          size="h2" 
          mb="md"
          style={{ 
            color: "#2d3748",
            fontWeight: 700
          }}
        >
          Access Denied
        </Title>
        
        <Text 
          size="lg" 
          mb="xl" 
          style={{ 
            color: "#718096",
            lineHeight: 1.6,
            maxWidth: 400,
            margin: "0 auto"
          }}
        >
          You don't have the necessary permissions to access this page. 
          Please contact your administrator if you believe this is an error.
        </Text>

        {/* Action Buttons */}
        <Flex gap="md" justify="center" wrap="wrap">
           
          <Button
            leftSection={<IconHome size={18} />}
            onClick={() => navigate({ to: "/dashboard" })}
            size="md"
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            }}
          >
            Dashboard
          </Button>
        </Flex>

        {/* Additional Help Text */}
        <Text 
          size="sm" 
          mt="xl" 
          style={{ 
            color: "#a0aec0",
            fontStyle: "italic"
          }}
        >
          Error code: 403 Forbidden
        </Text>
      </Paper>
    </Container>
  );
};

export default NoAccess;