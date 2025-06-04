import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../features/auth/context/AuthContext';

const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
`;

const WelcomeMessage = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 30px;
  text-align: center;
`;

const HomePage = () => {
  const { user } = useAuth();

  return (
    <HomePageContainer>
      <Title>Добро пожаловать в Интранет!</Title>
      {user ? (
        <WelcomeMessage>
          Привет, {user.fullName || user.email}! Рады видеть вас здесь.
          <br />
          Это ваша домашняя страница.
        </WelcomeMessage>
      ) : (
        <WelcomeMessage>
          Загрузка данных пользователя или вы не авторизованы...
        </WelcomeMessage>
      )}
      <WelcomeMessage>
        Скоро здесь появится больше полезной информации и функций.
      </WelcomeMessage>
    </HomePageContainer>
  );
};

export default HomePage; 