import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium, LabelMedium, LabelSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from './PatientService';

const DoctorDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState<boolean>(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadRecentPatients = async () => {
    try {
      setPatientsLoading(true);
      setPatientsError(null);
      const allPatients = await fetchAllPatients();
      
      // Sort patients by registration date (most recent first) and take the first 2
      const sortedPatients = allPatients
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 2);
      
      setRecentPatients(sortedPatients);
    } catch (error: any) {
      console.error('Error loading recent patients:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setPatientsError('Authentication failed. Please log in again.');
      } else {
        setPatientsError('Failed to load recent patients. Please try again.');
      }
      setRecentPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);
      const notificationData = await fetchNotifications();
      
      if (notificationData && notificationData.notifications) {
        setNotifications(notificationData.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setNotificationsError('Authentication failed. Please log in again.');
      } else {
        setNotificationsError('Failed to load notifications. Please try again.');
      }
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    // Load notifications and recent patients
    loadNotifications();
    loadRecentPatients();
  }, []);

  const handlePatientClick = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read (update local state)
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notification.id ? { 
          ...n, 
          recipients: n.recipients.map((recipient: any) => ({
            ...recipient,
            read: true
          }))
        } : n
      )
    );

    // In a real app, you might want to send a read receipt to the API here
    // await markNotificationAsRead(notification.id);

    // For now, we don't have specific patient navigation from notifications
    // but this could be enhanced based on notification data
  };

  return (
    <Block>
      <HeadingLarge>Doctor Dashboard</HeadingLarge>

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
              <HeadingMedium>Patients Requiring Review</HeadingMedium>
              {patientsLoading ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block>Loading recent patients...</Block>
                </Block>
              ) : patientsError ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block color="negative">Error: {patientsError}</Block>
                </Block>
              ) : recentPatients.length > 0 ? (
                recentPatients.map(patient => (
  <Block
    key={patient.id}
    marginBottom="scale600"
    padding="scale600"
    backgroundColor="mono100"
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    overrides={{
      Block: {
        style: {
          borderRadius: '8px',
          borderLeft: '4px solid #276EF1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          ':hover': {
            backgroundColor: 'mono200'
          }
        }
      }
    }}
  >
    <Block>
      <LabelMedium marginBottom="scale200" font="font550">
        {patient.name}
      </LabelMedium>
      <Block display="flex" flexWrap={true} marginBottom="scale200">
        <Block 
          display="flex" 
          alignItems="center" 
          marginRight="scale600"
          color="contentSecondary"
          font="font300"
        >
          <Block marginRight="scale200">Patient ID:</Block>
          <Block font="font400" color="contentPrimary">
            {patient.patientId || patient.id}
          </Block>
        </Block>
        <Block 
          display="flex" 
          alignItems="center"
          color="contentSecondary"
          font="font300"
        >
          <Block marginRight="scale200">Registered:</Block>
          <Block font="font400" color="contentPrimary">
            {new Date(patient.registrationDate).toLocaleDateString()}
          </Block>
        </Block>
      </Block>
      <Block 
        display="flex" 
        alignItems="center"
        color="warning"
        font="font300"
      >
        <Block 
          width="8px" 
          height="8px" 
          backgroundColor="warning" 
          marginRight="scale300"
          overrides={{
            Block: {
              style: {
                borderRadius: '50%'
              }
            }
          }}
        />
        Recently added - requires review
      </Block>
    </Block>
    <Button 
      onClick={() => handlePatientClick(patient.patientId || patient.id)} 
      size="compact"
      kind="secondary"
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
      }}
    >
      Review
    </Button>
  </Block>
))
              ) : (
                <Block padding="16px" font="font300">
                  No recent patients found
                </Block>
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/doctor/patients')}
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
                  View All Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>

          <Card>
            <StyledBody>
              <HeadingMedium>Quick Actions</HeadingMedium>
              <Block
                display="flex"
                flexWrap={true}
                style={{ gap: '16px' }}
              >
                <Button onClick={() => navigate('/doctor/patients')}
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
    }}>Search Patients</Button>
                <Button onClick={() => navigate('/doctor/notifications')}
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
              {notificationsLoading ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block>Loading notifications...</Block>
                </Block>
              ) : notificationsError ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="100px">
                  <Block color="negative">Error: {notificationsError}</Block>
                </Block>
              ) : notifications.length === 0 ? (
                <Block padding="16px" font="font300">
                  No new notifications
                </Block>
              ) : (
                notifications.map(notification => {
  // Get the first recipient's read status (assuming current user is first recipient)
  const isRead = notification.recipients && notification.recipients.length > 0 
    ? notification.recipients[0].read 
    : false;
  
  // Map notification type to background color
  const getBackgroundColor = (type: string, priority: string) => {
    if (type === 'WARNING' || priority === 'HIGH') {
      return 'rgba(255, 0, 0, 0.05)';
    } else if (type === 'INFO' && priority === 'MEDIUM') {
      return 'rgba(255, 165, 0, 0.05)';
    } else {
      return 'rgba(0, 0, 0, 0.02)';
    }
  };

  return (
    <Block
      key={notification.id}
      marginBottom="scale500"
      padding="scale600"
      backgroundColor={getBackgroundColor(notification.type, notification.priority)}
      overrides={{
        Block: {
          style: {
            borderRadius: '8px',
            borderLeft: notification.type === 'WARNING' || notification.priority === 'HIGH' 
              ? '4px solid #FF0000' 
              : notification.type === 'INFO' && notification.priority === 'MEDIUM'
              ? '4px solid #FFA500'
              : '4px solid #276EF1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isRead ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
            ':hover': {
              backgroundColor: isRead 
                ? getBackgroundColor(notification.type, notification.priority)
                : notification.type === 'WARNING' || notification.priority === 'HIGH'
                ? 'rgba(255, 0, 0, 0.08)'
                : notification.type === 'INFO' && notification.priority === 'MEDIUM'
                ? 'rgba(255, 165, 0, 0.08)'
                : 'rgba(0, 0, 0, 0.04)'
            }
          }
        }
      }}
      onClick={() => handleNotificationClick(notification)}
    >
      <Block display="flex" justifyContent="space-between" marginBottom="scale300">
        <LabelMedium 
          font="font550"
          overrides={{
            Block: {
              style: {
                color: notification.type === 'WARNING' || notification.priority === 'HIGH'
                  ? '#FF0000'
                  : notification.type === 'INFO' && notification.priority === 'MEDIUM'
                  ? '#FFA500'
                  : 'inherit'
              }
            }
          }}
        >
          {notification.title}
        </LabelMedium>
        <LabelSmall 
          color={notification.priority === 'HIGH' 
            ? 'negative' 
            : notification.priority === 'MEDIUM' 
            ? 'warning' 
            : 'positive'}
          font="font400"
          overrides={{
            Block: {
              style: {
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }
            }
          }}
        >
          {notification.priority}
        </LabelSmall>
      </Block>
      
      <Block 
        font="font400" 
        marginBottom="scale400"
        color="contentSecondary"
      >
        {notification.message}
      </Block>
      
      <Block display="flex" justifyContent="space-between" alignItems="center">
        <LabelSmall color="contentTertiary" font="font300">
          {new Date(notification.createdAt).toLocaleString()}
        </LabelSmall>
        <LabelSmall 
          color="primary" 
          font="font400"
          overrides={{
            Block: {
              style: {
                backgroundColor: 'rgba(39, 110, 241, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px'
              }
            }
          }}
        >
          {notification.category}
        </LabelSmall>
      </Block>
      
      {!isRead && (
        <Block 
          marginTop="scale300" 
          font="font300" 
          color="warning"
          display="flex"
          alignItems="center"
        >
          <Block 
            width="8px" 
            height="8px" 
            backgroundColor="warning" 
            marginRight="scale200"
            overrides={{
              Block: {
                style: {
                  borderRadius: '50%'
                }
              }
            }}
          />
          Unread
        </Block>
      )}
    </Block>
  );
                })
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/doctor/notifications')}
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

export default DoctorDashboard;
