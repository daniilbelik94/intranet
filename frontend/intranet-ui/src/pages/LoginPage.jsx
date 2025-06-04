import styled from 'styled-components';
import LoginForm from '../features/auth/components/LoginForm';
import AuthFormLink from '../features/auth/components/AuthFormLink';

const LoginPageContainer = styled.div`
  padding: 2rem 1rem; /* Увеличен вертикальный паддинг */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f2f2f7; /* Стандартный фон macOS/iOS */
`;

const Title = styled.h1`
  font-size: 2.125rem; /* 34px, как заголовки в настройках iOS */
  font-weight: 700; 
  color: #1d1d1f;
  margin-bottom: 2rem; /* Увеличен отступ снизу */
  text-align: center;
`;

const LoginContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; /* Для корректного центрирования формы */
`;

const LoginPage = () => {
  return (
    <LoginPageContainer>
      <LoginContentWrapper>
        <Title>Вход в Интранет</Title>
        <LoginForm />
        <AuthFormLink to="/register">Еще нет аккаунта? Зарегистрироваться</AuthFormLink>
        {/* TODO: Добавить ссылку "Забыли пароль?" */}
      </LoginContentWrapper>
    </LoginPageContainer>
  );
};

export default LoginPage; 