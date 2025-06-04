import styled from 'styled-components';
import RegistrationForm from '../features/auth/components/RegistrationForm';
import AuthFormLink from '../features/auth/components/AuthFormLink';

const RegistrationPageContainer = styled.div`
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f2f2f7;
`;

const Title = styled.h1`
  font-size: 2.125rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 2rem;
  text-align: center;
`;

const RegistrationContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const RegistrationPage = () => {
  return (
    <RegistrationPageContainer>
      <RegistrationContentWrapper>
        <Title>Регистрация в Интранет</Title>
        <RegistrationForm />
        <AuthFormLink to="/login">Уже есть аккаунт? Войти</AuthFormLink>
      </RegistrationContentWrapper>
    </RegistrationPageContainer>
  );
};

export default RegistrationPage; 