import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HeadingLarge, HeadingMedium, HeadingSmall, LabelMedium, LabelSmall } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Tabs, Tab } from 'baseui/tabs-motion';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { fetchPatientById, fetchMonthlyInvestigations, fetchDialysisSessions } from '../doctor/PatientService';

const NursePatientProfile: React.FC = () => {
  
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeKey, setActiveKey] = useState<string | number>('0');
  const navigate = useNavigate();

  // Monthly Investigations state
  const [monthlyInvestigations, setMonthlyInvestigations] = useState<any[]>([]);
  const [monthlyInvestigationsLoading, setMonthlyInvestigationsLoading] = useState<boolean>(false);
  const [monthlyInvestigationsError, setMonthlyInvestigationsError] = useState<string | null>(null);

  // Dialysis Sessions state  
  const [dialysisSessions, setDialysisSessions] = useState<any[]>([]);
  const [dialysisSessionsLoading, setDialysisSessionsLoading] = useState<boolean>(false);
  const [dialysisSessionsError, setDialysisSessionsError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  const loadPatientData = async () => {
    if (!id) return;
    
    try {
      const patientData = await fetchPatientById('RHD_THP_003'); // Replace with id when available
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  // Load monthly investigations
  const loadMonthlyInvestigations = async (patientId: string) => {
    try {
      setMonthlyInvestigationsLoading(true);
      setMonthlyInvestigationsError(null);
      const investigations = await fetchMonthlyInvestigations(patientId);
      setMonthlyInvestigations(investigations);
    } catch (error: any) {
      console.error('Error loading monthly investigations:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setMonthlyInvestigationsError('Authentication failed. Please log in again.');
      } else {
        setMonthlyInvestigationsError('Failed to load monthly investigations. Please try again.');
      }
      setMonthlyInvestigations([]);
    } finally {
      setMonthlyInvestigationsLoading(false);
    }
  };



  // Load dialysis sessions
  const loadDialysisSessions = async (patientId: string) => {
    try {
      setDialysisSessionsLoading(true);
      setDialysisSessionsError(null);
      const sessions = await fetchDialysisSessions(patientId);
      setDialysisSessions(sessions);
    } catch (error: any) {
      console.error('Error loading dialysis sessions:', error);
      if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
        setDialysisSessionsError('Authentication failed. Please log in again.');
      } else {
        setDialysisSessionsError('Failed to load dialysis sessions. Please try again.');
      }
      setDialysisSessions([]);
    } finally {
      setDialysisSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (patient && patient.patientId) {
      // Load monthly investigations when the patient data is available
      loadMonthlyInvestigations(patient.patientId);
      // Load dialysis sessions when the patient data is available
      loadDialysisSessions(patient.patientId);
    } 
  }, [patient]);

  function getFormattedMedicalHistory(medicalHistory: string | { renalDiagnosis: string; medicalProblems: Array<{ problem: string; diagnosedDate: string; status: string; }>; allergies: any[]; medications: any[]; }): React.ReactNode {
    if (typeof medicalHistory === 'string') {
      return medicalHistory;
    }
    
    if (medicalHistory && typeof medicalHistory === 'object') {
      return (
        <Block>
          {medicalHistory.renalDiagnosis && (
            <Block marginBottom="12px">
              <LabelMedium marginBottom="4px">Renal Diagnosis:</LabelMedium>
              <Block font="font400">{medicalHistory.renalDiagnosis}</Block>
            </Block>
          )}
          
          {medicalHistory.medicalProblems && medicalHistory.medicalProblems.length > 0 && (
            <Block marginBottom="12px">
              <LabelMedium marginBottom="4px">Medical Problems:</LabelMedium>
              {medicalHistory.medicalProblems.map((problem, index) => (
                <Block key={index} marginLeft="16px" marginTop="4px">
                  • {problem.problem} (Diagnosed: {problem.diagnosedDate}, Status: {problem.status})
                </Block>
              ))}
            </Block>
          )}
          
          {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
            <Block marginBottom="12px">
              <LabelMedium marginBottom="4px">Allergies:</LabelMedium>
              <Block font="font400">{medicalHistory.allergies.join(', ')}</Block>
            </Block>
          )}
          
          {medicalHistory.medications && medicalHistory.medications.length > 0 && (
            <Block marginBottom="12px">
              <LabelMedium marginBottom="4px">Current Medications:</LabelMedium>
              {medicalHistory.medications.map((medication: any, index: number) => (
                <Block key={index} marginLeft="16px" marginTop="4px">
                  • {medication.name} - {medication.dosage} ({medication.frequency})
                </Block>
              ))}
            </Block>
          )}
        </Block>
      );
    }
    
    return 'No medical history available';
  }

  function getFormattedAddress(address: string | { street: string; city: string; state: string; zipCode: string; country: string; }): string {
    if (typeof address === 'string') {
      return address;
    }
    
    if (address && typeof address === 'object') {
      return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    }
    
    return 'No address available';
  }

  function getFormattedEmergencyContact(emergencyContact: string | { name: string; relationship: string; phone: string; }): string {
    if (typeof emergencyContact === 'string') {
      return emergencyContact;
    }
    
    if (emergencyContact && typeof emergencyContact === 'object') {
      return `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`;
    }
    
    return 'No emergency contact available';
  }

  if (!patient) {
    return (
      <Block display="flex" justifyContent="center" alignItems="center" height="100vh">
        <HeadingLarge>Loading Patient Profile...</HeadingLarge>
      </Block>
    );
  }

  return (
    <Block padding="scale800">
      <HeadingLarge marginBottom="scale800">Patient Profile</HeadingLarge>
      
      <Grid gridMargins={0} gridGutters={16} gridMaxWidth={1200}>
        <Cell span={[4, 4, 4]}>
          <Card overrides={{ Root: { style: { borderRadius: '12px', marginBottom: '24px' } } }}>
            <StyledBody>
              <Block display="flex" flexDirection="column" alignItems="center" marginBottom="scale800">
                <Block
                  width="120px"
                  height="120px"
                  backgroundColor="primary200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overrides={{
                    Block: {
                      style: {
                        borderRadius: '50%',
                        fontSize: '48px',
                        fontWeight: 600,
                        color: 'primary'
                      }
                    }
                  }}
                  marginBottom="scale600"
                >
                  {patient.name.charAt(0).toUpperCase()}
                </Block>
                <HeadingMedium marginTop="0" marginBottom="scale300">
                  {patient.name}
                </HeadingMedium>
                <LabelSmall marginBottom="scale600">
                  ID: {patient.patientId || patient.id}
                </LabelSmall>
              </Block>

              <Block>
  {/* Personal Information Section */}
  <Block marginBottom="scale800">
    <LabelMedium 
      marginBottom="scale500"
      overrides={{
        Block: {
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: 'contentSecondary',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }
      }}
    >
      Personal Information
    </LabelMedium>
    
    <Block
      padding="scale600"
      backgroundColor="mono100"
      overrides={{
        Block: {
          style: {
            borderRadius: '8px'
          }
        }
      }}
    >
      {[
        { label: 'Age', value: patient.age },
        { label: 'Gender', value: patient.gender },
        { label: 'Blood Type', value: patient.bloodType },
        { label: 'Contact', value: patient.contactNumber },
        { 
          label: 'Emergency Contact', 
          value: getFormattedEmergencyContact(patient.emergencyContact),
          wide: true 
        },
        { 
          label: 'Assigned Doctor', 
          value: typeof patient.assignedDoctor === 'string' ? 
            patient.assignedDoctor : 
            patient.assignedDoctor?.name || 'Not assigned' 
        },
        { 
          label: 'Registration Date', 
          value: new Date(patient.registrationDate).toLocaleDateString() 
        }
      ].map((item, index) => (
        <Block 
          key={index}
          display="flex"
          justifyContent="space-between"
          marginBottom="scale500"
          alignItems="center"
        >
          <LabelSmall color="contentSecondary">{item.label}:</LabelSmall>
          <Block 
            font="font500" 
            color="contentPrimary"
            width={item.wide ? '60%' : 'auto'}
            overrides={{
              Block: {
                style: {
                  textAlign: item.wide ? 'right' : 'left',
                  wordBreak: 'break-word'
                }
              }
            }}
          >
            {item.value}
          </Block>
        </Block>
      ))}
    </Block>
  </Block>

  {/* Address Section */}
  <Block marginBottom="scale800">
    <LabelMedium 
      marginBottom="scale500"
      overrides={{
        Block: {
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: 'contentSecondary',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }
      }}
    >
      Address
    </LabelMedium>
    <Block
      padding="scale600"
      backgroundColor="mono100"
      font="font400"
      color="contentPrimary"
      overrides={{
        Block: {
          style: {
            borderRadius: '8px',
            whiteSpace: 'pre-line'
          }
        }
      }}
    >
      {getFormattedAddress(patient.address)}
    </Block>
  </Block>

  {/* Medical History Section */}
  <Block marginBottom="scale800">
    <LabelMedium 
      marginBottom="scale500"
      overrides={{
        Block: {
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: 'contentSecondary',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        }
      }}
    >
      Medical History
    </LabelMedium>
    <Block
      padding="scale600"
      backgroundColor="mono100"
      font="font400"
      color="contentPrimary"
      overrides={{
        Block: {
          style: {
            borderRadius: '8px',
            whiteSpace: 'pre-line'
          }
        }
      }}
    >
      {getFormattedMedicalHistory(patient.medicalHistory)}
    </Block>
  </Block>

  {/* Dialysis Information Section */}
  {patient.dialysisInfo && (
    <Block>
      <LabelMedium 
        marginBottom="scale500"
        overrides={{
          Block: {
            style: {
              fontSize: '14px',
              fontWeight: 500,
              color: 'contentSecondary',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }
          }
        }}
      >
        Dialysis Information
      </LabelMedium>
      <Block
        padding="scale600"
        backgroundColor="mono100"
        overrides={{
          Block: {
            style: {
              borderRadius: '8px'
            }
          }
        }}
      >
        {[
          { label: 'Type', value: patient.dialysisInfo.dialysisType },
          { label: 'Frequency', value: patient.dialysisInfo.frequency.replace('_', ' ') },
          { label: 'Access', value: `${patient.dialysisInfo.accessType} (${patient.dialysisInfo.accessSite})` },
          { label: 'Dry Weight', value: `${patient.dialysisInfo.dryWeight} kg` },
          { label: 'Target UFR', value: `${patient.dialysisInfo.targetUfr} ml/hr` }
        ].map((item, index) => (
          <Block 
            key={index}
            display="flex"
            justifyContent="space-between"
            marginBottom="scale300"
            alignItems="center"
          >
            <LabelSmall color="contentSecondary">{item.label}:</LabelSmall>
            <Block font="font500" color="contentPrimary">
              {item.value}
            </Block>
          </Block>
        ))}
      </Block>
    </Block>
  )}
</Block>

              <Block marginTop="scale1000">
                <Button 
                  onClick={() => navigate('/nurse/patients')}
                  overrides={{
                    BaseButton: {
                      style: {
                        width: '100%',
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        backgroundColor: '#276EF1',
                          color: '#FFF',
                          ':hover': {
                            backgroundColor: '#1A54C8'
                          },
                          ':active': {
                            backgroundColor: '#143FA6'
                          }
                      }
                    }
                  }}
                >
                  Back to Patients
                </Button>
              </Block>
            </StyledBody>
          </Card>
        </Cell>

        <Cell span={[4, 8, 8]}>
          <Card overrides={{ Root: { style: { borderRadius: '12px' } } }}>
            <StyledBody>
              <Tabs
                activeKey={activeKey}
                onChange={({ activeKey }) => {
                  if (typeof activeKey === 'string' || typeof activeKey === 'number') {
                    setActiveKey(activeKey);
                    // Load dialysis sessions when Latest Dialysis Session tab (index 0) is clicked
                    if (activeKey === '0' && patient && dialysisSessions.length === 0) {
                      loadDialysisSessions(patient.patientId || patient.id);
                    }
                    // Load monthly investigations when Monthly Investigation tab (index 1) is clicked
                    if (activeKey === '1' && patient && monthlyInvestigations.length === 0) {
                      loadMonthlyInvestigations(patient.patientId || patient.id);
                    }
                  }
                }}
                activateOnFocus
                overrides={{
                  TabBorder: {
                    style: {
                      height: '3px'
                    }
                  }
                }}
              >
                <Tab title="Latest Dialysis Session">
  <Block padding="scale800">
    <HeadingMedium marginTop="0" marginBottom="scale600">Latest Dialysis Session</HeadingMedium>
    
    {dialysisSessionsLoading ? (
      <Block 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        color="contentSecondary"
      >
        <Block>Loading dialysis sessions...</Block>
      </Block>
    ) : dialysisSessionsError ? (
      <Block 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        color="negative"
      >
        <Block>Error: {dialysisSessionsError}</Block>
      </Block>
    ) : dialysisSessions.length > 0 ? (
      <Block>
        {(() => {
          const latestSession = dialysisSessions[dialysisSessions.length - 1];
          return (
            <Block
              marginBottom="scale800"
              padding="scale800"
              backgroundColor="mono200"
              overrides={{
                Block: {
                  style: {
                    borderRadius: '8px',
                    borderLeft: '4px solid #276EF1'
                  }
                }
              }}
            >
              {/* Header Section */}
              <Block 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                marginBottom="scale600"
                flexDirection={['column', 'column', 'row']}
              >
                <HeadingSmall marginTop="0" marginBottom="0">
                  Session on {new Date(latestSession.date).toLocaleDateString()}
                </HeadingSmall>
                <LabelSmall 
                  overrides={{
                    Block: {
                      style: {
                        backgroundColor: 'mono300',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }
                    }
                  }}
                >
                  Session #{latestSession.sessionId}
                </LabelSmall>
              </Block>

              {/* Data Grid */}
              <Grid gridMargins={0} gridGutters={16}>
                {latestSession.id && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Session ID
                      </LabelMedium>
                      <Block font="font400">{latestSession.id}</Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.status && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Status
                      </LabelMedium>
                      <Block 
                        font="font400"
                        overrides={{
                          Block: {
                            style: {
                              color: latestSession.status === 'COMPLETED' ? 'positive' : 'contentPrimary',
                              fontWeight: 500
                            }
                          }
                        }}
                      >
                        {latestSession.status}
                      </Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.doctor && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Attending Doctor
                      </LabelMedium>
                      <Block font="font400">{latestSession.doctor.name}</Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.nurse && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Assigned Nurse
                      </LabelMedium>
                      <Block font="font400">{latestSession.nurse.name}</Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.date && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Date & Time
                      </LabelMedium>
                      <Block font="font400">{new Date(latestSession.date).toLocaleString()}</Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.notes && (
                  <Cell span={[4, 8, 12]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Notes
                      </LabelMedium>
                      <Block 
                        font="font400"
                        padding="scale400"
                        backgroundColor="mono100"
                        overrides={{
                          Block: {
                            style: {
                              borderRadius: '4px',
                              whiteSpace: 'pre-wrap'
                            }
                          }
                        }}
                      >
                        {latestSession.notes}
                      </Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.createdAt && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Record Created
                      </LabelMedium>
                      <Block font="font400">{new Date(latestSession.createdAt).toLocaleString()}</Block>
                    </Block>
                  </Cell>
                )}

                {latestSession.updatedAt && latestSession.updatedAt !== latestSession.createdAt && (
                  <Cell span={[4, 4, 6]}>
                    <Block marginBottom="scale600">
                      <LabelMedium 
                        marginBottom="scale300"
                        overrides={{ Block: { style: { fontWeight: 600 } } }}
                      >
                        Last Updated
                      </LabelMedium>
                      <Block font="font400">{new Date(latestSession.updatedAt).toLocaleString()}</Block>
                    </Block>
                  </Cell>
                )}
              </Grid>
            </Block>
          );
        })()}
      </Block>
    ) : (
      <Block
        padding="scale800"
        backgroundColor="mono200"
        display="flex"
        justifyContent="center"
        alignItems="center"
        overrides={{
          Block: {
            style: {
              borderRadius: '8px',
              minHeight: '200px'
            }
          }
        }}
      >
        <Block color="contentTertiary">
          No dialysis sessions recorded for this patient.
        </Block>
      </Block>
    )}
  </Block>
</Tab>
                
                <Tab title="Monthly Investigation">
  <Block padding="scale800">
    <HeadingMedium marginTop="0" marginBottom="scale600">Latest Monthly Investigation</HeadingMedium>
    
    {monthlyInvestigationsLoading ? (
      <Block 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        color="contentSecondary"
      >
        <Block>Loading monthly investigations...</Block>
      </Block>
    ) : monthlyInvestigationsError ? (
      <Block 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="200px"
        color="negative"
      >
        <Block>Error: {monthlyInvestigationsError}</Block>
      </Block>
    ) : monthlyInvestigations.length > 0 ? (
      <Block>
        {(() => {
          const latestInvestigation = monthlyInvestigations[0];
          return (
            <Block
              marginBottom="scale800"
              padding="scale800"
              backgroundColor="mono200"
              overrides={{
                Block: {
                  style: {
                    borderRadius: '8px',
                    borderLeft: '4px solid #276EF1'
                  }
                }
              }}
            >
              {/* Header Section */}
              <Block 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                marginBottom="scale600"
                flexDirection={['column', 'column', 'row']}
              >
                <HeadingSmall marginTop="0" marginBottom="0">
                  Investigation on {new Date(latestInvestigation.date).toLocaleDateString()}
                </HeadingSmall>
                <LabelSmall 
                  overrides={{
                    Block: {
                      style: {
                        backgroundColor: 'mono300',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }
                    }
                  }}
                >
                  ID: {latestInvestigation.investigationId}
                </LabelSmall>
              </Block>

              {/* Data Grid */}
              <Grid gridMargins={0} gridGutters={16}>
                {/* Renal Function */}
                <Cell span={[4, 8, 12]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Renal Function
                    </LabelMedium>
                    <Block display="flex" flexWrap font="font400">
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Creatinine Pre-HD:</Block>
                        {latestInvestigation.scrPreHD?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Creatinine Post-HD:</Block>
                        {latestInvestigation.scrPostHD?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">BUN:</Block>
                        {latestInvestigation.bu?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* CBC */}
                <Cell span={[4, 4, 4]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      CBC
                    </LabelMedium>
                    <Block font="font400">
                      <Block font="font300" color="contentSecondary">Hemoglobin:</Block>
                      {latestInvestigation.hb?.toFixed(2) || 'N/A'} g/dL
                    </Block>
                  </Block>
                </Cell>

                {/* Electrolytes */}
                <Cell span={[4, 8, 8]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Electrolytes
                    </LabelMedium>
                    <Block display="flex" flexWrap font="font400">
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Sodium Pre-HD:</Block>
                        {latestInvestigation.serumNaPreHD?.toFixed(2) || 'N/A'} mEq/L
                      </Block>
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Sodium Post-HD:</Block>
                        {latestInvestigation.serumNaPostHD?.toFixed(2) || 'N/A'} mEq/L
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">Potassium Pre-HD:</Block>
                        {latestInvestigation.serumKPreHD?.toFixed(2) || 'N/A'} mEq/L
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">Potassium Post-HD:</Block>
                        {latestInvestigation.serumKPostHD?.toFixed(2) || 'N/A'} mEq/L
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Bone & Mineral */}
                <Cell span={[4, 8, 8]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Bone & Mineral
                    </LabelMedium>
                    <Block display="flex" flexWrap font="font400">
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Calcium:</Block>
                        {latestInvestigation.sCa?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Phosphorus:</Block>
                        {latestInvestigation.sPhosphate?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">PTH:</Block>
                        {latestInvestigation.pth?.toFixed(2) || 'N/A'} pg/mL
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">Vitamin D:</Block>
                        {latestInvestigation.vitD?.toFixed(2) || 'N/A'} ng/mL
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Protein & Nutrition */}
                <Cell span={[4, 4, 6]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Protein & Nutrition
                    </LabelMedium>
                    <Block display="flex" flexWrap font="font400">
                      <Block width="100%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Albumin:</Block>
                        {latestInvestigation.albumin?.toFixed(2) || 'N/A'} g/dL
                      </Block>
                      <Block width="100%">
                        <Block font="font300" color="contentSecondary">Uric Acid:</Block>
                        {latestInvestigation.ua?.toFixed(2) || 'N/A'} mg/dL
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Iron Studies */}
                <Cell span={[4, 4, 6]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Iron Studies
                    </LabelMedium>
                    <Block display="flex" flexWrap={true} font="font400">
                      <Block width="100%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Serum Iron:</Block>
                        {latestInvestigation.serumIron?.toFixed(2) || 'N/A'} μg/dL
                      </Block>
                      <Block width="100%">
                        <Block font="font300" color="contentSecondary">Serum Ferritin:</Block>
                        {latestInvestigation.serumFerritin?.toFixed(2) || 'N/A'} ng/mL
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Other */}
                <Cell span={[4, 8, 8]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Other
                    </LabelMedium>
                    <Block display="flex" flexWrap={true} font="font400">
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">HbA1C:</Block>
                        {latestInvestigation.hbA1C?.toFixed(2) || 'N/A'}%
                      </Block>
                      <Block width="50%" marginBottom="scale300">
                        <Block font="font300" color="contentSecondary">Bicarbonate:</Block>
                        {latestInvestigation.hco?.toFixed(2) || 'N/A'} mEq/L
                      </Block>
                      <Block width="50%">
                        <Block font="font300" color="contentSecondary">Alkaline Phosphatase:</Block>
                        {latestInvestigation.al?.toFixed(2) || 'N/A'} U/L
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Laboratory Info */}
                <Cell span={[4, 8, 12]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Laboratory Info
                    </LabelMedium>
                    <Block font="font400">
                      <Block display="flex" marginBottom="scale300">
                        <Block width="150px" font="font300" color="contentSecondary">Requested by:</Block>
                        <Block>{latestInvestigation.laboratoryInfo?.requestedBy?.name || 'N/A'}</Block>
                      </Block>
                      <Block display="flex" marginBottom="scale300">
                        <Block width="150px" font="font300" color="contentSecondary">Performed by:</Block>
                        <Block>{latestInvestigation.laboratoryInfo?.performedBy?.name || 'N/A'}</Block>
                      </Block>
                      <Block display="flex" marginBottom="scale300">
                        <Block width="150px" font="font300" color="contentSecondary">Reported by:</Block>
                        <Block>{latestInvestigation.laboratoryInfo?.reportedBy?.name || 'N/A'}</Block>
                      </Block>
                      <Block display="flex">
                        <Block width="150px" font="font300" color="contentSecondary">Testing Method:</Block>
                        <Block>{latestInvestigation.laboratoryInfo?.testingMethod || 'N/A'}</Block>
                      </Block>
                    </Block>
                  </Block>
                </Cell>

                {/* Status */}
                <Cell span={[4, 4, 4]}>
                  <Block marginBottom="scale600">
                    <LabelMedium 
                      marginBottom="scale300"
                      overrides={{ Block: { style: { fontWeight: 600 } } }}
                    >
                      Status
                    </LabelMedium>
                    <Block 
                      font="font400"
                      overrides={{
                        Block: {
                          style: {
                            color: latestInvestigation.status === 'COMPLETED' ? 'positive' : 'contentPrimary',
                            fontWeight: 500
                          }
                        }
                      }}
                    >
                      {latestInvestigation.status}
                    </Block>
                  </Block>
                </Cell>
              </Grid>

              <Block 
                marginTop="scale600" 
                font="font300"
                color="contentSecondary"
              >
                Total investigations available: {monthlyInvestigations.length}
              </Block>
            </Block>
          );
        })()}
      </Block>
    ) : (
      <Block
        padding="scale800"
        backgroundColor="mono200"
        display="flex"
        justifyContent="center"
        alignItems="center"
        overrides={{
          Block: {
            style: {
              borderRadius: '8px',
              minHeight: '200px'
            }
          }
        }}
      >
        <Block color="contentTertiary">
          No monthly investigations recorded for this patient.
        </Block>
      </Block>
    )}
  </Block>
</Tab>
              </Tabs>
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default NursePatientProfile;