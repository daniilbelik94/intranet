import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getAllEmployees, updateMyProfile, adminUpdateUser, uploadAvatarFile } from '../features/employees/services/employeeService';
import { useAuth } from '../features/auth/context/AuthContext';
import Modal from '../components/common/Modal';

const PageContainer = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
`;

const EmployeeList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const EmployeeCard = styled.li`
  background-color: var(--color-background-elevated);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const EditIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background-color: var(--color-background-hover);
    color: var(--color-text-primary);
  }
`;

const EmployeeName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  padding-right: 25px;
`;

const EmployeeInfo = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
`;

// Заглушка для URL фото, если оно есть
const EmployeePhoto = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem; 
  font-weight: 500;
  color: var(--color-text-on-gradient, white);
  background-color: var(--color-background-muted);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const LoadingMessage = styled.p`
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 30px;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: var(--color-apple-red);
  text-align: center;
  padding: 30px;
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid var(--color-apple-red);
  border-radius: 8px;
`;

// Стили для формы редактирования в модальном окне
const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text-primary);
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-input);
  color: var(--color-text-input);
  font-size: 1rem;
  &:focus {
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light-focus);
  }
`;

const ReadOnlyInfo = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-muted);
  &:last-of-type {
    border-bottom: none;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  &.primary {
    background-color: var(--color-apple-blue-light);
    color: var(--color-apple-blue);
    border-color: var(--color-apple-blue-light);
    &:hover {
      background-color: var(--color-apple-blue);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
    }
  }

  &.secondary {
    background-color: var(--color-apple-red-light);
    color: var(--color-apple-red);
    border-color: var(--color-apple-red-light);
    &:hover {
    background-color: var(--color-apple-red);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
    }
  }
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-text-primary);
  font-size: 1.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
`;

const AvatarPreview = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 10px;
  border: 2px solid var(--color-border);
`;

const FileInputLabel = styled(Label)`
  display: inline-block;
  padding: 8px 12px;
  background-color: var(--color-background-muted);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: center;

  &:hover {
    background-color: var(--color-background-hover);
  }
`;

const HiddenFileInput = styled.input.attrs({ type: 'file' })`
  display: none;
`;

// --- Утилитарные функции ---
const getInitials = (name = '') => {
  if (!name) return '?';
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].substring(0, 1).toUpperCase();
  return (words[0].substring(0, 1) + words[words.length - 1].substring(0, 1)).toUpperCase();
};

// Функция для генерации пары цветов для градиента на основе строки (например, ID или имени)
const generateGradientColors = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Генерация двух цветов в HSL формате с фиксированной насыщенностью и светлотой
  // Hue будет варьироваться от 0 до 360
  const h1 = Math.abs(hash % 360);
  // Второй цвет с небольшим сдвигом по Hue для приятного градиента
  const h2 = (h1 + 45) % 360; 

  const s = 70; // Насыщенность
  const l = 80; // Светлота (для пастельных тонов)

  return [`hsl(${h1}, ${s}%, ${l}%)`, `hsl(${h2}, ${s}%, ${l}%)`];
};

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const SUCCESS_MESSAGE_TIMEOUT = 3000; // 3 секунды для сообщения об успехе

const EmployeeDirectoryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user: currentUser, setUser: setCurrentUserInAuth } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editedFields, setEditedFields] = useState({
    full_name: '',
    email: '',
    position: '',
    department: '',
    phone_number: '',
    photo_url: '',
    is_active: true,
    is_superuser: false,
  });
  const [editFormError, setEditFormError] = useState(null);

  // Новые состояния для загрузки аватара
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
  const fileInputRef = React.useRef(null); // Ref для инпута файла

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      setError('Пожалуйста, войдите в систему для просмотра справочника.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees(token);
      setEmployees(data || []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список сотрудников.');
      console.error("Failed to fetch employees:", err);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenEditModal = (employeeToEdit) => {
    setEditingEmployee(employeeToEdit);
    setEditedFields({
      full_name: employeeToEdit.full_name || '',
      email: employeeToEdit.email || '',
      position: employeeToEdit.position || '',
      department: employeeToEdit.department || '',
      phone_number: employeeToEdit.phone_number || '',
      photo_url: employeeToEdit.photo_url || '',
      is_active: employeeToEdit.is_active === undefined ? true : employeeToEdit.is_active,
      is_superuser: employeeToEdit.is_superuser === undefined ? false : employeeToEdit.is_superuser,
    });
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
    setEditFormError(null);
    setUpdateSuccessMessage('');
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
    setEditedFields({
      full_name: '', email: '', position: '', department: '',
      phone_number: '', photo_url: '', is_active: true, is_superuser: false
    });
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    setEditFormError(null);
    setUpdateSuccessMessage('');
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  };

  const handleEditFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedFields(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        setEditFormError(`Файл слишком большой. Максимальный размер: ${MAX_AVATAR_SIZE_BYTES / 1024 / 1024}MB.`);
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl(null);
        e.target.value = null;
        return;
      }
      setEditFormError('');
      setSelectedAvatarFile(file);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editingEmployee || !token || !currentUser) return;
    
    setIsUpdatingProfile(true);
    setEditFormError(null);
    setUpdateSuccessMessage('');

    let finalPhotoUrl = editedFields.photo_url;

    try {
      if (selectedAvatarFile) {
        const uploadResponse = await uploadAvatarFile(token, selectedAvatarFile);
        if (uploadResponse && uploadResponse.photo_url) {
          finalPhotoUrl = uploadResponse.photo_url;
        } else {
          console.error("Avatar upload failed:", uploadResponse);
          const errorDetail = uploadResponse?.detail || "Не удалось загрузить аватар.";
          setEditFormError(`Ошибка загрузки аватара: ${errorDetail} Пожалуйста, попробуйте снова или укажите URL.`);
          setIsUpdatingProfile(false);
          return;
        }
      }

      const isEditingSelf = editingEmployee.id === currentUser.id;
      const canAdminEdit = currentUser.is_superuser;
      let dataToUpdate = {};

      if (canAdminEdit) {
        Object.keys(editedFields).forEach(key => {
          if (key === 'photo_url') {
            if (finalPhotoUrl !== (editingEmployee.photo_url || '')) {
              if (finalPhotoUrl || editingEmployee.photo_url) {
                 dataToUpdate.photo_url = finalPhotoUrl;
              }
            }
          } else if (typeof editedFields[key] === 'boolean') {
            if (editedFields[key] !== (editingEmployee[key] === undefined ? (key === 'is_active' ? true : false) : editingEmployee[key])) {
              dataToUpdate[key] = editedFields[key];
            }
          } else {
            if (editedFields[key] !== (editingEmployee[key] || '')) {
              dataToUpdate[key] = editedFields[key];
            }
          }
        });
      } else if (isEditingSelf) {
        if (editedFields.phone_number !== (editingEmployee.phone_number || '')) {
          dataToUpdate.phone_number = editedFields.phone_number;
        }
        if (finalPhotoUrl !== (editingEmployee.photo_url || '')) {
            if (finalPhotoUrl || editingEmployee.photo_url) {
                dataToUpdate.photo_url = finalPhotoUrl;
            }
        }
      }

      if (Object.keys(dataToUpdate).length === 0 && !selectedAvatarFile) {
        handleCloseEditModal();
        setIsUpdatingProfile(false);
        return;
      }

      let updatedUserFromAPI;
      if (canAdminEdit) {
        updatedUserFromAPI = await adminUpdateUser(token, editingEmployee.id, dataToUpdate);
      } else if (isEditingSelf) {
        updatedUserFromAPI = await updateMyProfile(token, dataToUpdate);
      } else {
        setEditFormError("Нет прав для выполнения этого действия.");
        setIsUpdatingProfile(false);
        return;
      }
      
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => emp.id === updatedUserFromAPI.id ? updatedUserFromAPI : emp)
      );
      if (currentUser && currentUser.id === updatedUserFromAPI.id) {
        setCurrentUserInAuth(updatedUserFromAPI);
      }
      
      setUpdateSuccessMessage("Профиль успешно обновлен!");
      setSelectedAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }

      setTimeout(() => {
          handleCloseEditModal();
      }, SUCCESS_MESSAGE_TIMEOUT / 2);
      setTimeout(() => {
        setUpdateSuccessMessage('');
      }, SUCCESS_MESSAGE_TIMEOUT);

    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorDetail = err.response?.data?.detail || err.message || 'Не удалось обновить профиль.';
      setEditFormError(errorDetail);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (isLoading) {
    return <PageContainer><LoadingMessage>Загрузка сотрудников...</LoadingMessage></PageContainer>;
  }

  if (error) {
    return <PageContainer><ErrorMessage>{error}</ErrorMessage></PageContainer>;
  }

  const EmployeeCardItem = ({ employee, currentUserId, isCurrentUserAdmin }) => {
    const [imgError, setImgError] = useState(false);
    
    const baseApiUrl = import.meta.env.VITE_API_BASE_URL || '';
    const photoUrl = employee.photo_url 
      ? (employee.photo_url.startsWith('http') 
          ? employee.photo_url 
          : `${baseApiUrl}${employee.photo_url.startsWith('/') ? '' : '/'}${employee.photo_url}`) 
      : null;
    
    const canEditThisCard = (employee.id === currentUserId) || isCurrentUserAdmin;
    const showPhoto = photoUrl && !imgError;
    const initials = getInitials(employee.full_name);
    const gradientColors = generateGradientColors(employee.id?.toString() || employee.email || employee.full_name);
    const avatarStyle = !showPhoto ? { background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})` } : {};

    return (
      <EmployeeCard>
        {canEditThisCard && (
          <EditIcon onClick={() => handleOpenEditModal(employee)} title="Редактировать">
            ✎ 
          </EditIcon>
        )}
        <EmployeePhoto style={avatarStyle}>
          {showPhoto ? (
            <img src={photoUrl} alt={employee.full_name || 'Фото'} onError={() => setImgError(true)} />
          ) : (
            initials
          )}
        </EmployeePhoto>
        <EmployeeName>{employee.full_name || 'Имя не указано'}</EmployeeName>
        <EmployeeInfo><strong>Должность:</strong> {employee.position || <span style={{ color: 'var(--color-text-placeholder)' }}>не указана</span>}</EmployeeInfo>
        <EmployeeInfo><strong>Отдел:</strong> {employee.department || <span style={{ color: 'var(--color-text-placeholder)' }}>не указан</span>}</EmployeeInfo>
        <EmployeeInfo><strong>Email:</strong>{' '}{employee.email ? (<a href={`mailto:${employee.email}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{employee.email}</a>) : (<span style={{ color: 'var(--color-text-placeholder)' }}>не указан</span>)}</EmployeeInfo>
        <EmployeeInfo><strong>Тел:</strong>{' '}{employee.phone_number ? (<a href={`tel:${employee.phone_number}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{employee.phone_number}</a>) : (<span style={{ color: 'var(--color-text-placeholder)' }}>не указан</span>)}</EmployeeInfo>
        {isCurrentUserAdmin && <EmployeeInfo><strong>Active:</strong> {employee.is_active ? 'Да' : 'Нет'} | <strong>Admin:</strong> {employee.is_superuser ? 'Да' : 'Нет'}</EmployeeInfo>}
      </EmployeeCard>
    );
  };

  return (
    <PageContainer>
      <Title>Справочник сотрудников</Title>
      {employees.length > 0 ? (
        <EmployeeList>
          {employees.map((employee) => (
            <EmployeeCardItem 
              employee={employee} 
              key={employee.id} 
              currentUserId={currentUser?.id}
              isCurrentUserAdmin={currentUser?.is_superuser}
            />
          ))}
        </EmployeeList>
      ) : (
        <LoadingMessage>Сотрудники не найдены.</LoadingMessage>
      )}

      {editingEmployee && currentUser && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} size="medium">
          <ModalTitle>Редактировать профиль: {editingEmployee.full_name}</ModalTitle>
          {updateSuccessMessage && <p style={{ color: 'var(--color-apple-green)', textAlign: 'center', marginBottom: '15px' }}>{updateSuccessMessage}</p>}
          <EditForm onSubmit={handleProfileUpdate}>
            {currentUser.is_superuser ? (
              <>
                <FormGroup>
                  <Label htmlFor="full_name">ФИО:</Label>
                  <Input type="text" id="full_name" name="full_name" value={editedFields.full_name} onChange={handleEditFieldChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="email">Email:</Label>
                  <Input type="email" id="email" name="email" value={editedFields.email} onChange={handleEditFieldChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="position">Должность:</Label>
                  <Input type="text" id="position" name="position" value={editedFields.position} onChange={handleEditFieldChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="department">Отдел:</Label>
                  <Input type="text" id="department" name="department" value={editedFields.department} onChange={handleEditFieldChange} />
                </FormGroup>
              </>
            ) : (
              <>
                <FormGroup><Label>ФИО:</Label><ReadOnlyInfo>{editingEmployee.full_name || '-'}</ReadOnlyInfo></FormGroup>
                <FormGroup><Label>Email:</Label><ReadOnlyInfo>{editingEmployee.email || '-'}</ReadOnlyInfo></FormGroup>
                <FormGroup><Label>Должность:</Label><ReadOnlyInfo>{editingEmployee.position || '-'}</ReadOnlyInfo></FormGroup>
                <FormGroup><Label>Отдел:</Label><ReadOnlyInfo>{editingEmployee.department || '-'}</ReadOnlyInfo></FormGroup>
              </>
            )}
            
            <FormGroup>
              <Label htmlFor="phone_number">Номер телефона:</Label>
              <Input type="tel" id="phone_number" name="phone_number" value={editedFields.phone_number} onChange={handleEditFieldChange} 
                     readOnly={!currentUser.is_superuser && editingEmployee.id !== currentUser.id} />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="photo_url">URL аватара (если не загружаете файл):</Label>
              <Input 
                type="url" 
                id="photo_url" 
                name="photo_url" 
                value={editedFields.photo_url}
                onChange={handleEditFieldChange} 
                placeholder="https://example.com/image.jpg" 
                readOnly={!currentUser.is_superuser && editingEmployee.id !== currentUser.id && !currentUser.is_superuser}
                disabled={!!selectedAvatarFile}
              />
            </FormGroup>

            {(currentUser.is_superuser || editingEmployee.id === currentUser.id) && (
              <FormGroup>
                <Label style={{marginBottom: '8px'}}>{avatarPreviewUrl ? 'Новый аватар:' : 'Загрузить новый аватар:'}</Label>
                <HiddenFileInput ref={fileInputRef} id="avatarFileInput" onChange={handleAvatarFileChange} accept="image/*" />
                <FileInputLabel htmlFor="avatarFileInput">
                  {selectedAvatarFile ? selectedAvatarFile.name : "Выбрать файл"}
                </FileInputLabel>
                {avatarPreviewUrl && (
                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <AvatarPreview src={avatarPreviewUrl} alt="Предпросмотр аватара" />
                  </div>
                )}
              </FormGroup>
            )}

            {currentUser.is_superuser && (
              <>
                <FormGroup>
                  <CheckboxLabel>
                    <Checkbox name="is_active" checked={editedFields.is_active} onChange={handleEditFieldChange} />
                    Активен
                  </CheckboxLabel>
                </FormGroup>
                <FormGroup>
                  <CheckboxLabel>
                    <Checkbox name="is_superuser" checked={editedFields.is_superuser} onChange={handleEditFieldChange} />
                    Суперпользователь
                  </CheckboxLabel>
                </FormGroup>
              </>
            )}
            
            {editFormError && <ErrorMessage style={{ fontSize: '0.9rem', padding: '10px', marginTop: '0px', marginBottom: '10px' }}>{editFormError}</ErrorMessage>}
            
            <ModalActions>
              <Button type="button" className="secondary" onClick={handleCloseEditModal} disabled={isUpdatingProfile}>Отмена</Button>
              <Button type="submit" className="primary" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Сохранение..." : "Сохранить"}
              </Button>
            </ModalActions>
          </EditForm>
        </Modal>
      )}
    </PageContainer>
  );
};

export default EmployeeDirectoryPage; 