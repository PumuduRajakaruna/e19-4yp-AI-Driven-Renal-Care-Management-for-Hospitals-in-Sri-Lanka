import React, { useState, useEffect } from 'react';
import { HeadingLarge, HeadingMedium } from 'baseui/typography';
import { Card, StyledBody } from 'baseui/card';
import { Grid, Cell } from 'baseui/layout-grid';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton } from 'baseui/modal';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { Table } from 'baseui/table-semantic';
import { toaster } from 'baseui/toast';
import { User, Role } from '../../types';
import apiClient from '../../services/apiConfig';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: [{ id: Role.DOCTOR, label: 'Doctor' }],
    password: ''
  });

  // Modal functionalities
  const openEditModal = (user: any) => {
    setCurrentUser({
      ...user,
      role: [{ id: user.role, label: getRoleLabel(user.role) }]
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.NURSE:
        return 'Nurse';
      case Role.DOCTOR:
        return 'Doctor';
      case Role.ADMIN:
        return 'Admin';
      default:
        return '';
    }
  };

  // Fetch all users at the begining
  useEffect(() => {
    fetchAllUsers()
  }, []);

  // Close the Modal
  const closeAddUserModal = () => {
    setIsAddModalOpen(false)
    
    setNewUser({
      name: '',
      email: '',
      role: [{ id: Role.DOCTOR, label: 'Doctor' }],
      password: ''
    })
  }

  // 1. Function to fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get('/users')
      setUsers(response.data.users);
    }
    catch (error: any) {
      toaster.negative('Failed to fetch users', { autoHideDuration: 3000 });
    }
  }

  // 2. Function to handle adding a new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || newUser.role.length === 0) {
      toaster.negative('Please fill in all fields', { autoHideDuration: 3000 })
      return 0
    }

    // Send data to the Database
    try {
      const sendData = await apiClient.post('/users',
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role[0].id
        }
      )

      toaster.positive('User added successfully', { autoHideDuration: 3000 })

      // Reset form
      setNewUser({
        name: '',
        email: '',
        role: [{ id: Role.DOCTOR, label: 'Doctor' }],
        password: ''
      })

      // Take the updated users list
      fetchAllUsers()

      // Close the Modal
      setIsAddModalOpen(false)
    }

    catch (error: any) {
      console.log(error.response.data.errors);

      if (error.response && error.response.data.errors) {
        error.response.data.errors.forEach((err: any) => {
          toaster.negative(err.msg, { autoHideDuration: 3000 });
        })
      }
      toaster.negative('Failed to add user', { autoHideDuration: 3000 })
    }
  }

  // 3. Function to update existing user
  const handleEditUser = async () => {
    if (!currentUser.name || !currentUser.email || !currentUser.role || currentUser.role.length === 0) {
      toaster.negative('Please fill in all required fields', { autoHideDuration: 3000 })
      return 0
    }

    try {
      // Send PUT request with apiClient
      const updateData = await apiClient.put(`/users/${currentUser.id}`,
        {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role[0].id
        }
      )

      toaster.positive('User Updated successfully', { autoHideDuration: 3000 });

      // Take the updated users list
      fetchAllUsers()

      // Close the Modal
      setIsEditModalOpen(false)
    }

    catch (error) {
      toaster.negative('Failed to update user', { autoHideDuration: 3000 })
    }
  }

  // 4. Function to delete existing user
  const handleDeleteUser = async () => {
    if (!currentUser || !currentUser.id) {
      toaster.negative('Invalid user data', { autoHideDuration: 3000 })
      return 0
    }

    console.log('Deleting user:', currentUser.id);

    try {
      const deleteData = await apiClient.delete(`/users/${currentUser.id}`)

      toaster.positive('User Deleted successfully', { autoHideDuration: 3000 })

      // Take the users list
      fetchAllUsers()

      // Close the Modal
      setIsDeleteModalOpen(false)
    }

    catch (error) {
      toaster.negative('Failed to Delete user', { autoHideDuration: 3000 })
    }
  }

  return (
    <Block>
      <HeadingLarge>User Management</HeadingLarge>

      <Grid gridMargins={[16, 32]} gridGutters={[16, 32]} gridMaxWidth={1200}>
        <Cell span={12}>
          <Card>
            <StyledBody>
              <Block display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
                <HeadingMedium marginTop="0" marginBottom="0">
                  All Users
                </HeadingMedium>
                <Button onClick={() => setIsAddModalOpen(true)}
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
    }}>Add New User</Button>
              </Block>

              <Table
                columns={['ID', 'Name', 'Email', 'Role', 'Last Active', 'Actions']}
                data={users.map(user => [
                  user.id,
                  user.name,
                  user.email,
                  getRoleLabel(user.role),
                  user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
                  <Block
                    key={`actions-${user.id}`}
                    display="flex"
                    overrides={{
                      Block: {
                        style: {
                          gap: '8px',
                        },
                      },
                    }}
                  >
                    <Button
                      size="compact"
                      kind="secondary"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="compact"
                      kind="tertiary"
                      onClick={() => openDeleteModal(user)}
                    >
                      Delete
                    </Button>
                  </Block>
                ])}
                emptyMessage="No users found"
              />
            </StyledBody>
          </Card>
        </Cell>
      </Grid>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddUserModal}
        closeable
        animate
        autoFocus
      >
        <ModalHeader>Add New User</ModalHeader>
        <ModalBody>
          <FormControl label="Name*">
            <Input
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.currentTarget.value })}
              placeholder="Enter user's full name"
            />
          </FormControl>

          <FormControl label="Email*">
            <Input
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.currentTarget.value })}
              placeholder="Enter user's email"
              type="email"
            />
          </FormControl>

          <FormControl label="Password* (Password must be at least 6 characters)">
            <Input
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.currentTarget.value })}
              placeholder="Enter password"
              type="password"
            />
          </FormControl>

          <FormControl label="Role*">
            <Select
              options={[
                { id: Role.NURSE, label: 'Nurse' },
                { id: Role.DOCTOR, label: 'Doctor' }
              ]}
              value={newUser.role}
              placeholder="Select user role"
              onChange={params => {
                const roles = params.value.map(item => ({
                  id: item.id as Role,
                  label: item.label as string,
                }));
                setNewUser({ ...newUser, role: roles });
              }}
            />
          </FormControl>

        </ModalBody>
        <ModalFooter>
          <ModalButton kind="tertiary" onClick={closeAddUserModal}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleAddUser}
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
    }}>Add User</ModalButton>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      {currentUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          closeable
          animate
          autoFocus
        >
          <ModalHeader>Edit User</ModalHeader>
          <ModalBody>
            <FormControl label="Name *">
              <Input
                value={currentUser.name}
                onChange={e => setCurrentUser({ ...currentUser, name: e.currentTarget.value })}
                placeholder="Enter user's full name"
              />
            </FormControl>

            <FormControl label="Email *">
              <Input
                value={currentUser.email}
                onChange={e => setCurrentUser({ ...currentUser, email: e.currentTarget.value })}
                placeholder="Enter user's email"
                type="email"
              />
            </FormControl>

            <FormControl label="Role *">
              <Select
                options={[
                  { id: Role.NURSE, label: 'Nurse' },
                  { id: Role.DOCTOR, label: 'Doctor' }
                ]}
                value={currentUser.role}
                placeholder="Select user role"
                onChange={params => setCurrentUser({ ...currentUser, role: [...params.value] })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton onClick={handleEditUser}
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
    }}>Save Changes</ModalButton>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete User Modal */}
      {currentUser && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          closeable
          animate
          autoFocus
        >
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            <Block>
              Are you sure you want to delete the user <strong>{currentUser.name}</strong>? This action cannot be undone.
            </Block>
          </ModalBody>
          <ModalFooter>
            <ModalButton kind="tertiary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </ModalButton>
            <ModalButton kind="negative" onClick={handleDeleteUser}>Delete</ModalButton>
          </ModalFooter>
        </Modal>
      )}
    </Block>
  );
};

export default AdminUserManagement;
