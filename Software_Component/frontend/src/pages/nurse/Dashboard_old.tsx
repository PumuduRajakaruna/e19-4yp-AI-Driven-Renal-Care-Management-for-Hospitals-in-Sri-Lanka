import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
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
      <Block marginBottom="32px">
        <HeadingLarge 
          color="primary600"
          overrides={{
            Block: {
              style: {
                borderBottom: '3px solid #0073e6',
                paddingBottom: '12px',
                marginBottom: '8px'
              }
            }
          }}
        >
          Nurse Dashboard
        </HeadingLarge>
        <Block font="font400" color="contentTertiary">
          Welcome back! Here's your patient overview and notifications.
        </Block>
      </Block>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={[4, 8, 8]}>
          <Card
            overrides={{
              Root: {
                style: {
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 115, 230, 0.1)'
                },
              },
            }}
          >
            <StyledBody>
              <Block display="flex" alignItems="center" marginBottom="20px">
                <Block
                  width="32px"
                  height="32px"
                  backgroundColor="positive100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="12px"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '8px'
                      }
                    }
                  }}
                >
                  <Block color="positive600" font="font600">👥</Block>
                </Block>
                <HeadingMedium marginTop="0" marginBottom="0" color="primary600">
                  Recent Patients
                </HeadingMedium>
              </Block>

              {recentPatients.length > 0 ? (
                recentPatients.map(patient => (
                  <Block
                    key={patient.id}
                    marginBottom="16px"
                    padding="20px"
                    backgroundColor="positive50"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    overrides={{
                      Block: {
                        style: {
                          borderRadius: '12px',
                          border: '1px solid rgba(40, 167, 69, 0.2)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(40, 167, 69, 0.15)'
                          }
                        }
                      }
                    }}
                    onClick={() => handlePatientClick(patient.id || patient.patientId || '')}
                  >
                    <Block>
                      <Block font="font600"  color="contentPrimary" marginBottom="4px">
                        {patient.name}
                      </Block>
                      <Block color="primary500" font="font400" marginBottom="2px">
                        Patient ID: {patient.patientId || patient.id}
                      </Block>
                      <Block color="contentTertiary" font="font400" marginBottom="4px">
                        Age: {patient.age} | Gender: {patient.gender}
                      </Block>
                      <Block 
                        color="positive600" 
                        font="font500" 
                  
                        backgroundColor="positive100"
                        padding="4px 8px"
                        overrides={{
                          Block: {
                            style: {
                              borderRadius: '6px',
                              display: 'inline-block'
                            }
                          }
                        }}
                      >
                        Active Patient
                      </Block>
                    </Block>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePatientClick(patient.id || patient.patientId || '');
                      }}
                      size="compact"
                      kind="secondary"
                      overrides={{
                        BaseButton: {
                          style: {
                            backgroundColor: '#0073e6',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#005bb5'
                            }
                          }
                        }
                      }}
                    >
                      View
                    </Button>
                  </Block>
                ))
              ) : (
                <Block 
                  padding="24px" 
                  font="font400" 
                  color="contentTertiary"
                  backgroundColor="rgba(0, 0, 0, 0.02)"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '8px'
                      }
                    }
                  }}
                >
                  No patients found
                </Block>
              )}
              
              <Block display="flex" justifyContent="center" marginTop="20px">
                <Button 
                  onClick={() => navigate('/nurse/patients')}
                  overrides={{
                    BaseButton: {
                      style: {
                        backgroundColor: '#0073e6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 24px',
                        '&:hover': {
                          backgroundColor: '#005bb5'
                        }
                      }
                    }
                  }}
                >
                  View All Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>

          <Card
            overrides={{
              Root: {
                style: {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 115, 230, 0.1)'
                },
              },
            }}
          >
            <StyledBody>
              <Block display="flex" alignItems="center" marginBottom="20px">
                <Block
                  width="32px"
                  height="32px"
                  backgroundColor="primary100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="12px"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '8px'
                      }
                    }
                  }}
                >
                  <Block color="primary600" font="font600">⚡</Block>
                </Block>
                <HeadingMedium marginTop="0" marginBottom="0" color="primary600">
                  Quick Actions
                </HeadingMedium>
              </Block>
              
              <Block
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gridGap="16px"
              >
                <Button 
                  onClick={() => navigate('/nurse/patients')}
                  overrides={{
                    BaseButton: {
                      style: {
                        backgroundColor: '#f8f9fa',
                        color: '#0073e6',
                        border: '2px solid #0073e6',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '16px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#0073e6',
                          color: 'white',
                          transform: 'translateY(-2px)'
                        }
                      }
                    }
                  }}
                >
                  Search Patients
                </Button>
                <Button 
                  onClick={() => navigate('/nurse/notifications')}
                  overrides={{
                    BaseButton: {
                      style: {
                        backgroundColor: '#f8f9fa',
                        color: '#0073e6',
                        border: '2px solid #0073e6',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '16px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#0073e6',
                          color: 'white',
                          transform: 'translateY(-2px)'
                        }
                      }
                    }
                  }}
                >
                  All Notifications
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 4]}>
          <Card
            overrides={{
              Root: {
                style: {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 115, 230, 0.1)',
                  height: 'fit-content'
                },
              },
            }}
          >
            <StyledBody>
              <Block display="flex" alignItems="center" marginBottom="20px">
                <Block
                  width="32px"
                  height="32px"
                  backgroundColor="primary100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="12px"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '8px'
                      }
                    }
                  }}
                >
                  <Block color="primary600" font="font600">🔔</Block>
                </Block>
                <HeadingMedium marginTop="0" marginBottom="0" color="primary600">
                  Notifications
                </HeadingMedium>
              </Block>

              {notifications.length === 0 ? (
                <Block 
                  padding="24px" 
                  font="font400" 
                  color="contentTertiary"
                  backgroundColor="rgba(0, 0, 0, 0.02)"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '8px'
                      }
                    }
                  }}
                >
                  No new notifications
                </Block>
              ) : (
                notifications.map(notification => {
                  // Get the first recipient's read status (assuming current user is first recipient)
                  const isRead = notification.recipients && notification.recipients.length > 0 
                    ? notification.recipients[0].read 
                    : false;
                  
                  // Map notification type to background color and border
                  const getNotificationStyle = (type: string, priority: string) => {
                    if (type === 'WARNING' || priority === 'HIGH') {
                      return {
                        backgroundColor: 'rgba(255, 99, 99, 0.1)',
                        borderLeft: '4px solid #ff6363'
                      };
                    } else if (type === 'INFO' && priority === 'MEDIUM') {
                      return {
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        borderLeft: '4px solid #ffa500'
                      };
                    } else {
                      return {
                        backgroundColor: 'rgba(0, 115, 230, 0.1)',
                        borderLeft: '4px solid #0073e6'
                      };
                    }
                  };

                  const notificationStyle = getNotificationStyle(notification.type, notification.priority);

                  return (
                    <Block
                      key={notification.id}
                      marginBottom="12px"
                      padding="16px"
                      backgroundColor={notificationStyle.backgroundColor}
                      overrides={{
                        Block: {
                          style: {
                            borderRadius: '10px',
                            borderLeft: notificationStyle.borderLeft,
                            border: isRead ? 'none' : '1px solid rgba(0, 115, 230, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }
                          }
                        }
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Block display="flex" justifyContent="space-between" marginBottom="8px">
                        <Block font="font600" color="contentPrimary">
                          {notification.title}
                        </Block>
                        <Block 
                          font="font500" 
                          color="primary600"
                          backgroundColor="primary100"
                          padding="2px 8px"
                          overrides={{
                            Block: {
                              style: {
                                borderRadius: '6px',
                                fontSize: '12px'
                              }
                            }
                          }}
                        >
                          {notification.priority}
                        </Block>
                      </Block>
                      <Block
                        font="font400"
                        color="contentSecondary"
                        marginBottom="12px"
                        overrides={{
                          Block: {
                            style: {
                              fontSize: '13px'
                            }
                          }
                        }}
                      >
                        {notification.message}
                      </Block>
                      <Block display="flex" justifyContent="space-between" alignItems="center">
                        <Block 
                          color="contentTertiary" 
                          font="font400" 
                          overrides={{
                            Block: {
                              style: {
                                fontSize: '11px'
                              }
                            }
                          }}
                        >
                          {new Date(notification.createdAt).toLocaleString()}
                        </Block>
                        <Block 
                          font="font500" 
                          color="primary500"
                          backgroundColor="primary50"
                          padding="2px 6px"
                          overrides={{
                            Block: {
                              style: {
                                borderRadius: '4px',
                                fontSize: '11px'
                              }
                            }
                          }}
                        >
                          {notification.category}
                        </Block>
                      </Block>
                      {!isRead && (
                        <Block 
                          marginTop="8px" 
                          font="font500" 
                          color="warning600"
                          display="flex"
                          alignItems="center"
                          overrides={{
                            Block: {
                              style: {
                                fontSize: '12px'
                              }
                            }
                          }}
                        >
                          <Block 
                            width="6px" 
                            height="6px" 
                            backgroundColor="warning600" 
                            marginRight="6px"
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
              
              <Block display="flex" justifyContent="center" marginTop="20px">
                <Button 
                  onClick={() => navigate('/nurse/notifications')}
                  overrides={{
                    BaseButton: {
                      style: {
                        backgroundColor: '#0073e6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '12px 24px',
                        '&:hover': {
                          backgroundColor: '#005bb5'
                        }
                      }
                    }
                  }}
                >
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

export default NurseDashboard;
