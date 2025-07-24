import React, { useState, useEffect } from 'react'
import { HeadingLarge } from 'baseui/typography'
import { Card, StyledBody } from 'baseui/card'
import { Grid, Cell } from 'baseui/layout-grid'
import { Block } from 'baseui/block'
import { Button } from 'baseui/button'
import { useNavigate } from 'react-router-dom'
import { Input } from 'baseui/input'
import { FormControl } from 'baseui/form-control'
import { Table } from 'baseui/table-semantic'
import { PatientCatalogue } from '../../types'
import { toaster } from 'baseui/toast'

import axios from 'axios'

const NursePatientSearch: React.FC = () => {
  const token = localStorage.getItem('userToken')
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<PatientCatalogue[]>([])
  const [filteredPatients, setFilteredPatients] = useState<PatientCatalogue[]>([])

  // Fetch Patient Catalogue data from the API
  const fetchAllPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      setPatients(response.data.patients)
      setFilteredPatients(response.data.patients)
    }
    catch (error: any) {
      toaster.negative('Failed to fetch the Patients', { autoHideDuration: 3000 })
    }
  }

  // Fetch all patients on component moun
  useEffect(() => {
    fetchAllPatients()
  }, [])

  // Filtering patients based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        patient =>
          patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } 
    
    else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])


  const handleViewPatient = (patientId: string) => {
    navigate(`/nurse/patients/${patientId}`)
  }

  const handleAddNewPatient = () => {
    navigate(`/nurse/patients/add`)
  }

  return (
  <Block>
    <HeadingLarge>Patient Search</HeadingLarge>

    <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
      <Cell span={12}>
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
            <Block 
              display="flex" 
              alignItems="center" 
              marginBottom="8px"
              overrides={{
                Block: {
                  style: {
                    gap: '16px' // Adds consistent spacing between items
                  }
                }
              }}
            >
              <Block flex="1"> {/* Takes remaining space */}
                <FormControl 
  label="Search Patients"
  overrides={{
    Label: {
      style: {
        fontSize: '26px',  // Increased from default 14px
        lineHeight: '20px', // Adjust line height to match
        paddingBottom: '8px' // Maintain proper spacing
      }
    }
  }}
>
  <Input
    value={searchTerm}
    onChange={e => setSearchTerm(e.currentTarget.value)}
    placeholder="Search by Patient ID or Name"
    clearable
    clearOnEscape
    overrides={{
      Input: {
        style: {
          height: '48px' // Matches button height
        }
      },
      InputContainer: {
        style: {
          marginBottom: 0 // Removes default margin
        }
      }
    }}
  />
</FormControl>
              </Block>
              
              <Button 
                onClick={handleAddNewPatient}
                overrides={{
                  BaseButton: {
                    style: {
                      backgroundColor: '#276EF1',
                      color: '#FFF',
                      width: '200px',
                      height: '48px',
                      minWidth: '200px',
                      minHeight: '48px',
                      marginTop: '24px', // Aligns with input field
                      ':hover': {
                        backgroundColor: '#1A54C8' // Slightly darker on hover
                      },
                      ':active': {
                        backgroundColor: '#143FA6' // Even darker on active
                      }
                    }
                  }
                }}
              >
                Add New Patient
              </Button>
            </Block>

            <Table
              columns={['ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Contact Number', 'Assigned Doctor', 'Actions']}
              data={filteredPatients.map(patient => {
                return [
                  patient.patientId,
                  patient.name,
                  patient.age,
                  patient.gender,
                  patient.bloodType,
                  patient.contactNumber,
                  patient.assignedDoctor?.name || "N/A",
                  <Button 
                    key={patient.id} 
                    onClick={() => handleViewPatient(patient.id)} 
                    size="compact"
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
                    }}
                  >
                    View
                  </Button>
                ]
              })}
            />
          </StyledBody>
        </Card>
      </Cell>
    </Grid>
  </Block>
)
}

export default NursePatientSearch