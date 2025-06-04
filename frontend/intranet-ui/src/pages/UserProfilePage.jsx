import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: var(--color-background-elevated);
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 10px;
`;

const UserInfoSection = styled.div`
  margin-bottom: 20px;
  p {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
    strong {
      color: var(--color-text-primary);
    }
  }
`;

const PlaceholderText = styled.p`
  font-style: italic;
  color: var(--color-text-secondary);
`;

const UserProfilePage = () => {
  const { userId } = useParams(); // Получаем ID пользователя из URL
  const { user: loggedInUser } = useAuth(); // Получаем данные текущего залогиненного пользователя

  // Здесь должна быть логика загрузки данных пользователя по userId
  // Например, fetchUserById(userId). Пока это заглушка.

  const displayUser = userId === loggedInUser?.id?.toString() ? loggedInUser : null;

  return (
    <PageContainer>
      <Title>Профиль пользователя {userId}</Title>
      {displayUser ? (
        <UserInfoSection>
          <p><strong>ID:</strong> {displayUser.id}</p>
          <p><strong>Email:</strong> {displayUser.email}</p>
          <p><strong>Полное имя:</strong> {displayUser.full_name || 'Не указано'}</p>
          <p><strong>Активен:</strong> {displayUser.is_active ? 'Да' : 'Нет'}</p>
          <p><strong>Суперпользователь:</strong> {displayUser.is_superuser ? 'Да' : 'Нет'}</p>
          {/* Другие поля из модели User могут быть добавлены здесь */}
          <PlaceholderText>
            (Это базовая информация. Расширенная информация о профиле будет добавлена позже.)
          </PlaceholderText>
        </UserInfoSection>
      ) : (
        <PlaceholderText>
          Загрузка данных пользователя {userId} или информация недоступна...
        </PlaceholderText>
      )}
      
      {/* Здесь можно будет добавить возможность редактирования профиля,
          если это профиль текущего пользователя или у админа есть права */} 
    </PageContainer>
  );
};

export default UserProfilePage; 