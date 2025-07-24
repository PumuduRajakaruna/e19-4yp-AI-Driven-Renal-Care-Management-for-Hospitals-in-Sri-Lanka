import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '3',
    title: 'New Doctor Registered',
    message: 'Dr. James Wilson has registered and is awaiting role assignment.',
    date: '2025-05-31T08:00:00',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    userId: '3',
    title: 'System Update',
    message: 'System will be updated to version 2.5 on June 5th. Please inform all staff.',
    date: '2025-05-30T14:30:00',
    read: true,
    type: 'info',
  },
];

// Mock user stats
const userStats = {
  totalDoctors: 12,
  totalNurses: 28,
  pendingApprovals: 3,
  recentlyActive: 35,
};

const AdminDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    setNotifications(mockNotifications);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <Block>
      <HeadingLarge>Admin Dashboard</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={[4, 8, 8]}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px',
                },
              },
            }}
          >
            <StyledBody>
              <HeadingMedium>User Statistics</HeadingMedium>

              <Block
                display="flex"
                overrides={{
                  Block: {
                    style: {
                      flexWrap: 'wrap',
                      gap: '16px',
                    },
                  },
                }}
              >
                {[
                  {
                    label: 'Total Doctors',
                    value: userStats.totalDoctors,
                    color: undefined,
                  },
                  {
                    label: 'Total Nurses',
                    value: userStats.totalNurses,
                    color: undefined,
                  },
                  {
                    label: 'Pending Approvals',
                    value: userStats.pendingApprovals,
                    color: userStats.pendingApprovals > 0 ? 'warning' : 'inherit',
                  },
                  {
                    label: 'Recently Active Users',
                    value: userStats.recentlyActive,
                    color: undefined,
                  },
                ].map(({ label, value, color }) => (
                  <Block
                    key={label}
                    width="calc(50% - 8px)"
                    padding="16px"
                    overrides={{
                      Block: {
                        style: {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        },
                      },
                    }}
                  >
                    <Block font="font400">{label}</Block>
                    <Block
                      font="font700"
                      color={color}
                      overrides={{
                        Block: {
                          style: {
                            fontSize: '24px',
                          },
                        },
                      }}
                    >
                      {value}
                    </Block>
                  </Block>
                ))}
              </Block>

              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/admin/user-management')}
                  overrides={{
      BaseButton: {
          style: {
            backgroundColor: '#276EF1',
            color: '#FFF',
            ':hover': {
              backgroundColor: '#276EF1'
            },
            ':active': {
              backgroundColor: '#276EF1'
            }
          }
        }
    }}>
                  Manage Users
                </Button>
              </Block>
            </StyledBody>
          </Card>

          <Card>
            <StyledBody>
              <HeadingMedium>Quick Actions</HeadingMedium>

              <Block
                display="flex"
                overrides={{
                  Block: {
                    style: {
                      flexWrap: 'wrap',
                      gap: '16px',
                    },
                  },
                }}
              >
                <Button onClick={() => navigate('/admin/user-management')}>
                  User Management
                </Button>
                <Button onClick={() => navigate('/admin/notifications')}>
                  All Notifications
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 4]}>
          <Card>
            <StyledBody>
              <HeadingMedium>Notifications</HeadingMedium>
              {notifications.length === 0 ? (
                <Block padding="16px" font="font300">
                  No new notifications
                </Block>
              ) : (
                notifications.map((notification) => (
                  <Block
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    overrides={{
                      Block: {
                        style: {
                          marginBottom: '16px',
                          padding: '16px',
                          backgroundColor:
                            notification.type === 'critical'
                              ? 'rgba(255, 0, 0, 0.1)'
                              : notification.type === 'warning'
                                ? 'rgba(255, 165, 0, 0.1)'
                                : 'rgba(0, 0, 0, 0.03)',
                          border: notification.read
                            ? 'none'
                            : '2px solid rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                        },
                      },
                    }}
                  >
                    <Block font="font500">{notification.title}</Block>
                    <Block font="font300">{notification.message}</Block>
                    <Block
                      color="primary400"
                      font="font300"
                      overrides={{
                        Block: { style: { marginTop: '8px' } },
                      }}
                    >
                      {new Date(notification.date).toLocaleString()}
                    </Block>
                  </Block>
                ))
              )}

              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/admin/notifications')}
                  overrides={{
      BaseButton: {
          style: {
            backgroundColor: '#276EF1',
            color: '#FFF',
            ':hover': {
              backgroundColor: '#276EF1'
            },
            ':active': {
              backgroundColor: '#276EF1'
            }
          }
        }
    }}>
                  View All Notifications
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default AdminDashboard;