import React, { useState, useEffect } from 'react';
import { HeadingLarge } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Input } from 'baseui/input';
import { FormControl } from 'baseui/form-control';
import { Table } from 'baseui/table-semantic';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { fetchAllPatients } from './PatientService';

const DoctorPatientSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getAssignedDoctorName = (doctor: string | any): string => {
    if (typeof doctor === 'string') return doctor;
    if (doctor && typeof doctor === 'object') {
      return doctor.name || 'N/A';
    }
    return 'N/A';
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const patientsData = await fetchAllPatients();
        setPatients(patientsData);
      } catch (error: any) {
        console.error('Error loading patients:', error);
        if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
          setError('Authentication failed. Please log in again.');
          // Optionally redirect to login
          // navigate('/login');
        } else {
          setError('Failed to load patients. Please try again.');
        }
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  return (
    <Block>
      <HeadingLarge>Patient Search</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card overrides={{ Root: { style: { marginBottom: '20px' } } }}>
            <StyledBody>
              <Block display="flex" alignItems="flex-end" marginBottom="16px">
                <Block flex="1" marginRight="8px">
                  <FormControl label="Search Patients">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.currentTarget.value)}
                      placeholder="Search by Patient ID, Name, Doctor, Blood Type, or Gender"
                      clearable
                      clearOnEscape
                      disabled={loading}
                      overrides={{
                        Input: {
                          style: {
                            borderTopRightRadius: '0',
                            borderBottomRightRadius: '0'
                          }
                        }
                      }}
                    />
                  </FormControl>
                </Block>
                  
              </Block>

              {loading ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                  <Block>Loading patients...</Block>
                </Block>
              ) : error ? (
                <Block display="flex" justifyContent="center" alignItems="center" height="200px">
                  <Block color="negative">Error: {error}</Block>
                </Block>
              ) : (
                <Table
                  columns={['Patient ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Assigned Doctor', 'Actions']}
                  data={patients.map((patient) => [
                    patient.patientId || patient.id,
                    patient.name,
                    patient.age || 'N/A',
                    patient.gender,
                    patient.bloodType,
                    getAssignedDoctorName(patient.assignedDoctor),
                    <Button key={patient.id} size="compact" onClick={() => handleViewPatient(patient.patientId ?? patient.id)}
                     overrides={{
                      BaseButton: {
                        style: {
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
                    }}>
                      View
                    </Button>,
                  ])}
                  emptyMessage="No patients found"
                />
              )}
            </StyledBody>
          </Card>
        </Cell>
      </Grid>
    </Block>
  );
};

export default DoctorPatientSearch;
