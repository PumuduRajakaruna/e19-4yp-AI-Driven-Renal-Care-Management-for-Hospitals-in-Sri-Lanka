import React, { useState, useEffect, MouseEvent } from 'react';
import { HeadingLarge, HeadingMedium, LabelMedium, LabelSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { useNavigate } from 'react-router-dom';
import { Notification, Patient } from '../../types';
import { fetchAllPatients, fetchNotifications } from '../doctor/PatientService';

const NurseDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load patients and notifications in parallel
      const [patientsData, notificationsData] = await Promise.all([
        fetchAllPatients(),
        fetchNotifications()
      ]);

      // Set recent patients (first 5)
      setRecentPatients(patientsData.slice(0, 5));
      
      // Set notifications
      if (notificationsData && notificationsData.notifications) {
        setNotifications(notificationsData.notifications.slice(0, 5)); // Show latest 5
      } else if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData.slice(0, 5));
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      if (error.message?.includes('Authentication failed')) {
        setError('Authentication failed. Please log in again.');
        // Could redirect to login here
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`);
  };

  const handleNotificationClick = (notification: any) => {
    // Navigate to related patient if available
    if (notification.relatedPatientId || notification.patientId) {
      navigate(`/nurse/patients/${notification.relatedPatientId || notification.patientId}`);
    }
  };

  if (loading) {
    return (
      <Block>
        <HeadingLarge>Nurse Dashboard</HeadingLarge>
        <Block display="flex" justifyContent="center" alignItems="center" height="200px">
          <Block>Loading dashboard data...</Block>
        </Block>
      </Block>
    );
  }

  if (error) {
    return (
      <Block>
        <HeadingLarge>Nurse Dashboard</HeadingLarge>
        <Block display="flex" justifyContent="center" alignItems="center" height="200px">
          <Block color="negative">Error: {error}</Block>
        </Block>
        <Block display="flex" justifyContent="center" marginTop="16px">
          <Button onClick={loadDashboardData}>Retry</Button>
        </Block>
      </Block>
    );
  }

  return (
    <Block>
      <HeadingLarge>Nurse Dashboard</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={[4, 8, 8]}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '20px'
                }
              }
            }}
          >
            <StyledBody>
              <HeadingMedium>Recent Patients</HeadingMedium>
              {recentPatients.length === 0 ? (
                <Block padding="16px" font="font300">
                  No patients available
                </Block>
              ) : (
                recentPatients.map(patient => <Block
  key={patient.id || patient.patientId}
  marginBottom="scale600"
  padding="scale700"
  backgroundColor="mono100"
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  overrides={{
    Block: {
      style: {
        borderRadius: '8px',
        borderLeft: '4px solid #276EF1',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        ':hover': {
          backgroundColor: 'mono200'
        }
      }
    }
  }}
>
  <Block>
    <LabelMedium 
      marginBottom="scale300"
      font="font550"
      color="contentPrimary"
    >
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
        <Block marginRight="scale200">Age:</Block>
        <Block font="font400" color="contentPrimary">{patient.age}</Block>
        <Block marginLeft="scale400" marginRight="scale200">Gender:</Block>
        <Block font="font400" color="contentPrimary">{patient.gender}</Block>
      </Block>
    </Block>
    
    <Block 
      display="flex" 
      alignItems="center"
      marginBottom="scale200"
      color="contentSecondary"
      font="font300"
    >
      <Block marginRight="scale200">Blood Type:</Block>
      <Block 
        font="font400" 
        color="contentPrimary"
        overrides={{
          Block: {
            style: {
              textTransform: 'uppercase'
            }
          }
        }}
      >
        {patient.bloodType}
      </Block>
    </Block>
    
    <Block 
      display="flex" 
      alignItems="center"
      color="contentSecondary"
      font="font300"
    >
      <Block marginRight="scale200">Doctor:</Block>
      <Block font="font400" color="contentPrimary">
        {typeof patient.assignedDoctor === 'string' ? 
          patient.assignedDoctor : 
          patient.assignedDoctor?.name || 'Not assigned'}
      </Block>
    </Block>
  </Block>
  
  <Button
    onClick={() => handlePatientClick(patient.patientId || patient.id || '')}
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
    View
  </Button>
</Block>)
              )}
              <Block display="flex" justifyContent="center" marginTop="16px">
                <Button onClick={() => navigate('/nurse/patients')}
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
              <Block display="flex" flexWrap={true} style={{ gap: '16px' }}>
                <Button onClick={() => navigate('/nurse/patients')}
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
                  Search Patients
                </Button>
                <Button onClick={() => navigate('/nurse/submission-status')}
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
                  View Submissions
                </Button>
                <Button onClick={() => navigate('/nurse/notifications')}
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
                <Button onClick={() => navigate('/nurse/add-patient')}
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
                  Add New Patient
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
                notifications.map(notification => <Block
  key={notification.id}
  marginBottom="scale600"
  padding="scale700"
  backgroundColor={
    notification.type === 'critical' || notification.priority === 'high'
      ? 'rgba(255, 0, 0, 0.05)'
      : notification.type === 'warning' || notification.priority === 'medium'
        ? 'rgba(255, 165, 0, 0.05)'
        : 'rgba(0, 0, 0, 0.02)'
  }
  overrides={{
    Block: {
      style: {
        borderRadius: '8px',
        borderLeft: notification.type === 'critical' || notification.priority === 'high'
          ? '4px solid #FF0000'
          : notification.type === 'warning' || notification.priority === 'medium'
            ? '4px solid #FFA500'
            : '4px solid #276EF1',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: notification.read ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
        border: notification.read ? 'none' : '1px solid rgba(0,0,0,0.1)',
        ':hover': {
          backgroundColor: notification.type === 'critical' || notification.priority === 'high'
            ? 'rgba(255, 0, 0, 0.08)'
            : notification.type === 'warning' || notification.priority === 'medium'
              ? 'rgba(255, 165, 0, 0.08)'
              : 'rgba(0, 0, 0, 0.04)'
        }
      }
    }
  }}
  onClick={() => handleNotificationClick(notification)}
>
  <LabelMedium
    marginBottom="scale300"
    font="font550"
    color={
      notification.type === 'critical' || notification.priority === 'high'
        ? '#FF0000'
        : notification.type === 'warning' || notification.priority === 'medium'
          ? '#FFA500'
          : 'contentPrimary'
    }
  >
    {notification.title}
  </LabelMedium>
  
  <Block
    font="font400"
    marginBottom="scale400"
    color="contentSecondary"
  >
    {notification.message}
  </Block>
  
  <LabelSmall
    color="contentTertiary"
    font="font300"
  >
    {notification.date ? new Date(notification.date).toLocaleString() : 
     notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 
     'No date available'}
  </LabelSmall>
  
  {!notification.read && (
    <Block
      marginTop="scale300"
      display="flex"
      alignItems="center"
    >
      <Block
        width="8px"
        height="8px"
        backgroundColor={
          notification.type === 'critical' || notification.priority === 'high'
            ? '#FF0000'
            : notification.type === 'warning' || notification.priority === 'medium'
              ? '#FFA500'
              : '#276EF1'
        }
        marginRight="scale200"
        overrides={{
          Block: {
            style: {
              borderRadius: '50%'
            }
          }
        }}
      />
      <LabelSmall
        color={
          notification.type === 'critical' || notification.priority === 'high'
            ? 'negative'
            : notification.type === 'warning' || notification.priority === 'medium'
              ? 'warning'
              : 'primary'
        }
        font="font300"
      >
        Unread
      </LabelSmall>
    </Block>
  )}
</Block>)
              )}
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NurseDashboard;
