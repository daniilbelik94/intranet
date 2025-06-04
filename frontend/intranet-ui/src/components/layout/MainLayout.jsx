import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import styled from 'styled-components';

const MainLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background, #f0f2f5); /* Добавим фон по умолчанию */
`;

const ContentContainer = styled.main`
  flex-grow: 1;
  /* padding: 20px; уберем отсюда, пусть страницы сами управляют отступами если нужно */
  /* Это позволит страницам типа DashboardPage или MyNewsPage использовать свой PageContainer с отступами */
`;

const MainLayout = () => {
  return (
    <MainLayoutContainer>
      <Header />
      <ContentContainer>
        <Outlet />
      </ContentContainer>
    </MainLayoutContainer>
  );
};

export default MainLayout; 