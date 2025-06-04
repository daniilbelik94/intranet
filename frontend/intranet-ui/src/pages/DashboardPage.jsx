import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 20px;
`;

const WelcomeMessage = styled.p`
  font-size: 1.2rem;
  color: var(--color-text-secondary);
`;

const DashboardPage = () => {
  return (
    <PageContainer>
      <Title>Панель управления</Title>
      <WelcomeMessage>
        Добро пожаловать в интранет!
      </WelcomeMessage>
      {/* Сюда можно будет добавить виджеты, статистику и быстрые ссылки */}
    </PageContainer>
  );
};

export default DashboardPage; 