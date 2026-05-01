import { 
  Paper, 
  SimpleGrid, 
  ThemeIcon, 
  Badge, 
  Table, 
  Divider,
  Button,
  Box,
  Text,
  Flex,
  Center,
  Loader,
  Avatar,
  Stack,
  Group,
  ScrollArea,
  useMantineTheme,
  Skeleton
} from "@mantine/core";
import { 
  IconUsers, 
  IconBuildingStore, 
  IconFolders, 
  IconUserShield,
  IconArrowRight,
  IconAlertCircle,
  IconChartBar
} from "@tabler/icons-react";
import { useFetchDashboardDetails, useFetchAdminStats } from "../queries/dashboard";
import { useFetchMySchoolStats } from "../queries/schoolAdmin";
import { useAuthStore } from "../config/authStore";
import { useNavigate } from "@tanstack/react-router"; // Added for navigation
import dayjs from "dayjs";

const Dashboard = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { user, role } = useAuthStore();
  const { data: profileData, isLoading: profileLoading, error } = useFetchDashboardDetails();

  const isSchoolAdmin = (role?.name || role)?.toString()?.toLowerCase() === 'school_admin';
  const isSuperAdmin = !isSchoolAdmin;

  const { data: schoolStats, isLoading: statsLoading } = useFetchMySchoolStats(isSchoolAdmin);
  const { data: adminStats, isLoading: adminStatsLoading } = useFetchAdminStats(isSuperAdmin);

  const isLoading = profileLoading || (isSchoolAdmin && statsLoading) || (isSuperAdmin && adminStatsLoading);

  const THEME_PRIMARY = theme.colors.sage[5];
  const THEME_LIGHT = theme.colors.sage[2];
  const THEME_DARK = theme.colors.sage[9];
  const THEME_BG = theme.colors.sage[0];

  if (isLoading) {
      return (
          <Box p="md">
              {/* Header Skeleton */}
              <Flex align="center" justify="space-between" mb={40}>
                <Box>
                    <Skeleton h={45} w={350} mb="xs" radius="md" />
                    <Skeleton h={15} w={250} radius="xs" />
                </Box>
                <Flex align="center" gap="md" visibleFrom="sm">
                    <Box style={{ textAlign: 'right' }}>
                        <Skeleton h={12} w={150} mb={6} radius="xs" />
                        <Skeleton h={8} w={80} ml="auto" radius="xs" />
                    </Box>
                    <Skeleton h={45} w={45} circle />
                </Flex>
              </Flex>

              {/* StatCards Skeleton */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: isSuperAdmin ? 4 : 2 }} spacing="xl" mb={40}>
                  {Array(isSuperAdmin ? 4 : 2).fill(0).map((_, i) => (
                      <Paper key={i} p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}22` }}>
                          <Group justify="space-between" mb="xl">
                              <Skeleton h={44} w={44} radius="md" />
                              <Skeleton h={20} w={50} radius="xs" />
                          </Group>
                          <Skeleton h={10} w="40%" mb={12} radius="xs" />
                          <Skeleton h={35} w="60%" mb={10} radius="xs" />
                          <Skeleton h={10} w="75%" radius="xs" />
                      </Paper>
                  ))}
              </SimpleGrid>

              {/* Activity Section Skeleton */}
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                  {/* Table Skeleton */}
                  <Paper p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}22` }}>
                      <Group justify="space-between" mb="xl">
                          <Box>
                            <Skeleton h={20} w={150} mb="xs" radius="xs" />
                            <Skeleton h={12} w={200} radius="xs" />
                          </Box>
                          <Skeleton h={30} w={80} radius="md" />
                      </Group>
                      <Stack gap="md">
                          {Array(4).fill(0).map((_, i) => (
                              <Group key={i} justify="space-between">
                                  <Group>
                                      <Skeleton h={32} w={32} circle />
                                      <Box>
                                          <Skeleton h={12} w={120} mb={6} radius="xs" />
                                          <Skeleton h={8} w={80} radius="xs" />
                                      </Box>
                                  </Group>
                                  <Skeleton h={15} w={60} radius="xs" />
                              </Group>
                          ))}
                      </Stack>
                  </Paper>

                  {/* Info Card Skeleton */}
                  <Paper p="xl" radius="lg" style={{ border: `1px solid ${THEME_LIGHT}22` }}>
                      <Stack gap="xl" h="100%">
                          <Box>
                            <Group justify="space-between" mb="md">
                                <Skeleton h={50} w={50} radius="xl" />
                                <Skeleton h={20} w={80} radius="xs" />
                            </Group>
                            <Skeleton h={25} w="60%" mb="xs" radius="xs" />
                            <Skeleton h={12} w="90%" radius="xs" />
                          </Box>

                          <SimpleGrid cols={2} spacing="md">
                                <Skeleton h={60} radius="md" />
                                <Skeleton h={60} radius="md" />
                          </SimpleGrid>

                          <Divider color={`${THEME_LIGHT}11`} />

                          <Box>
                            <Skeleton h={15} w={100} mb="md" radius="xs" />
                            <SimpleGrid cols={2} spacing="md">
                                <Skeleton h={35} radius="md" />
                                <Skeleton h={35} radius="md" />
                            </SimpleGrid>
                          </Box>

                          <Skeleton h={40} mt="auto" radius="md" />
                      </Stack>
                  </Paper>
              </SimpleGrid>
          </Box>
      );
  }

  if (error || !profileData) {
      return (
          <Center h="100%">
              <Text color="red">Unable to load dashboard data. Please try again.</Text>
          </Center>
      );
  }

  const userDetails = profileData?.user || user;

  const StatCard = ({ title, value, icon: Icon, subtext }) => (
    <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
      <Group justify="space-between" mb="xs">
        <ThemeIcon size={44} radius="md" variant="light" color={THEME_PRIMARY} style={{ backgroundColor: `${THEME_LIGHT}33`, color: THEME_PRIMARY }}>
          <Icon size={24} />
        </ThemeIcon>
        <Badge variant="outline" style={{ color: THEME_PRIMARY, borderColor: THEME_PRIMARY }} size="sm">Live</Badge>
      </Group>
      <Box>
        <Text size="xs" color="dimmed" fw={700} tt="uppercase" style={{ color: `${THEME_DARK}88` }}>{title}</Text>
        <Text size={32} fw={700} color={THEME_DARK} style={{ lineHeight: 1.2 }}>{value}</Text>
        <Text size="xs" color="dimmed" style={{ color: `${THEME_DARK}66` }}>{subtext}</Text>
      </Box>
    </Paper>
  );

  const getRecentStudents = () => {
      if (isSuperAdmin) return adminStats?.recent_students || [];
      return schoolStats?.data?.recent_students || schoolStats?.recent_students || [];
  };

  const recentStudents = getRecentStudents();

  return (
    <Box p="md" style={{ minHeight: "100vh" }}>
      {/* Top Header Row */}
      <Flex align="center" justify="space-between" mb={40}>
        <Box>
            <Text style={{ fontSize: "2.4rem", fontWeight: 500, color: THEME_DARK, fontFamily: "Georgia, serif" }}>
                Welcome, {userDetails?.name}
            </Text>
            <Text size="sm" style={{ color: `${THEME_DARK}88` }}>
                {isSchoolAdmin ? `Administrator of ${profileData?.school?.school_name}` : "System Overview & Administration Dashboard"}
            </Text>
        </Box>

        <Flex align="center" gap="md" visibleFrom="sm" style={{ 
            backgroundColor: "#ffffff", 
            padding: "8px 12px 8px 20px", 
            borderRadius: "50px", 
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: `1px solid ${THEME_LIGHT}`
        }}>
            <Box style={{ textAlign: 'right' }}>
                <Text color={THEME_PRIMARY} size="xs" fw={700}>{userDetails?.email}</Text>
                <Text size="10px" tt="uppercase" style={{ color: `${THEME_DARK}66` }}>{(role?.name || role)?.toString().replace('_', ' ')}</Text>
            </Box>
            <Avatar 
                radius="xl" 
                size="md" 
                style={{ backgroundColor: THEME_LIGHT, color: THEME_DARK, fontWeight: 600, border: "2px solid #ffffff" }}
            >
                {userDetails?.name?.charAt(0).toUpperCase()}
            </Avatar>
        </Flex>
      </Flex>

      {/* Statistics Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: isSuperAdmin ? 4 : 2 }} spacing="xl" mb={40}>
        {isSchoolAdmin ? (
          <>
            <StatCard title="Total Students" value={schoolStats?.data?.total_students || schoolStats?.total_students || 0} icon={IconUsers} subtext="Enrolled in your institution" />
            <StatCard title="Active Batches" value={schoolStats?.data?.total_batches || schoolStats?.total_batches || 0} icon={IconFolders} subtext="Current academic batches" />
          </>
        ) : (
          <>
            <StatCard title="Registered Schools" value={adminStats?.total_schools || 0} icon={IconBuildingStore} subtext="Onboarded institutions" />
            <StatCard title="Global Students" value={adminStats?.total_students || 0} icon={IconUsers} subtext="Total system enrollment" />
            <StatCard title="System Admins" value={adminStats?.total_admins || 0} icon={IconUserShield} subtext="Privileged users" />
            <StatCard title="Global Batches" value={adminStats?.total_batches || 0} icon={IconFolders} subtext="Across all schools" />
          </>
        )}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">

          {/* Recent Enrollments */}
          <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
              <Group justify="space-between" mb="xl">
                <Box>
                    <Text fw={700} size="lg" color={THEME_DARK}>Recent Enrollments</Text>
                    <Text size="xs" style={{ color: `${THEME_DARK}66` }}>
                        {isSuperAdmin ? "Latest students added across all institutions" : "Latest records added to your institution"}
                    </Text>
                </Box>
                <Button 
                    variant="light" 
                    style={{ backgroundColor: `${THEME_LIGHT}33`, color: THEME_PRIMARY }} 
                    radius="md" 
                    size="xs" 
                    rightSection={<IconArrowRight size={14} />}
                    onClick={() => navigate({ to: '/manage-students' })}
                >
                    View All
                </Button>
              </Group>

              {recentStudents.length > 0 ? (
                  <ScrollArea h={300}>
                      <Table verticalSpacing="sm">
                          <Table.Thead>
                              <Table.Tr>
                                  <Table.Th><Text size="xs" tt="uppercase" style={{ color: `${THEME_DARK}66` }}>Student</Text></Table.Th>
                                  <Table.Th><Text size="xs" tt="uppercase" style={{ color: `${THEME_DARK}66` }}>Admission No</Text></Table.Th>
                                  <Table.Th><Text size="xs" tt="uppercase" style={{ color: `${THEME_DARK}66` }}>Date</Text></Table.Th>
                              </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                              {recentStudents.map((student) => (
                                  <Table.Tr key={student.id}>
                                      <Table.Td>
                                          <Group gap="sm">
                                              <Avatar size="sm" radius="xl" style={{ backgroundColor: THEME_LIGHT, color: THEME_DARK }}>
                                                  {student.student_name?.charAt(0)}
                                              </Avatar>
                                              <Stack gap={0}>
                                                <Text size="sm" fw={600} color={THEME_DARK}>{student.student_name}</Text>
                                                <Text size="10px" style={{ color: `${THEME_DARK}66` }}>{student.email_id || "No email"}</Text>
                                              </Stack>
                                          </Group>
                                      </Table.Td>
                                      <Table.Td>
                                          <Badge variant="light" style={{ backgroundColor: `${THEME_LIGHT}33`, color: THEME_PRIMARY }} size="xs">
                                              {student.admission_no || "N/A"}
                                          </Badge>
                                      </Table.Td>
                                      <Table.Td>
                                          <Text size="sm" style={{ color: `${THEME_DARK}88` }}>{dayjs(student.created_at).format('DD MMM')}</Text>
                                      </Table.Td>
                                  </Table.Tr>
                              ))}
                          </Table.Tbody>
                      </Table>
                  </ScrollArea>
              ) : (
                  <Center py="xl">
                      <Stack align="center" gap="xs">
                          <IconUsers size={40} color={THEME_LIGHT} />
                          <Text size="sm" style={{ color: `${THEME_DARK}44` }}>No recent enrollments found.</Text>
                      </Stack>
                  </Center>
              )}
          </Paper>

          {/* Platform Performance Section */}
          <Paper p="xl" radius="lg" style={{ backgroundColor: "#ffffff", border: `1px solid ${THEME_LIGHT}44` }}>
              <Stack gap="xl" h="100%">
                  <Box>
                    <Group justify="space-between">
                        <ThemeIcon style={{ backgroundColor: `${THEME_LIGHT}33`, color: THEME_PRIMARY }} size={50} radius="xl">
                            <IconChartBar size={28} />
                        </ThemeIcon>
                        <Badge variant="light" color="sage" style={{ fontWeight: 700 }}>System Pulse</Badge>
                    </Group>
                    <Text fw={700} size="xl" mt="md" color={THEME_DARK}>Platform Performance</Text>
                    <Text size="sm" style={{ color: `${THEME_DARK}88` }}>
                        {isSuperAdmin ? "Monitoring activity across all connected institutions." : "Overview of your institution's growth and data management."}
                    </Text>
                  </Box>

                  {isSuperAdmin && adminStats?.active_admins !== undefined && (
                      <Box>
                         <SimpleGrid cols={2} spacing="md">
                            <Paper p="md" radius="md" style={{ backgroundColor: `${THEME_BG}44`, border: `1px solid ${THEME_LIGHT}33` }}>
                                <Text size="xs" style={{ color: THEME_PRIMARY }} tt="uppercase" fw={700}>Active Admins</Text>
                                <Text size="xl" fw={700} color={THEME_DARK}>{adminStats.active_admins}</Text>
                            </Paper>
                            <Paper p="md" radius="md" style={{ backgroundColor: `${THEME_BG}44`, border: `1px solid ${THEME_LIGHT}33` }}>
                                <Text size="xs" style={{ color: THEME_PRIMARY }} tt="uppercase" fw={700}>Inactive</Text>
                                <Text size="xl" fw={700} color={THEME_DARK}>{adminStats.inactive_admins}</Text>
                            </Paper>
                         </SimpleGrid>
                      </Box>
                  )}

                  <Divider color={`${THEME_LIGHT}22`} />

                  <Box>
                    <Text size="sm" fw={600} mb="xs" color={THEME_DARK}>Quick Actions</Text>
                    <SimpleGrid cols={2} spacing="md">
                        <Button 
                            variant="filled" 
                            style={{ backgroundColor: THEME_PRIMARY, color: "white" }} 
                            radius="md" 
                            size="xs" 
                            fullWidth
                            onClick={() => navigate({ to: isSuperAdmin ? '/manage-schools' : '/my-school' })}
                        >
                            {isSuperAdmin ? "Manage Schools" : "Manage Institution"}
                        </Button>
                        <Button 
                            variant="outline" 
                            color="sage" 
                            radius="md" 
                            size="xs" 
                            fullWidth
                            onClick={() => navigate({ to: '/manage-students', search: { add: true } })}
                        >
                            {isSuperAdmin ? "Student Registry" : "Enroll Student"}
                        </Button>
                    </SimpleGrid>
                  </Box>

                  <Box mt="auto" p="md" style={{ backgroundColor: THEME_BG, borderRadius: "12px", border: `1px solid ${THEME_LIGHT}22` }}>
                      <Group gap="sm">
                        <IconAlertCircle size={18} color={THEME_PRIMARY} />
                        <Text size="xs" style={{ color: `${THEME_DARK}88` }}>
                            Last system sync: {dayjs().format('DD MMM, HH:mm')}
                        </Text>
                      </Group>
                  </Box>
              </Stack>
          </Paper>

      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
