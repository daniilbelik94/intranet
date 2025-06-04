import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import Input from '../../../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Стили Form и Button можно вынести в общие компоненты, если они часто повторяются
// Пока оставим их здесь для наглядности
const FormStyled = styled.form`
  width: 100%;
  max-width: 22rem; /* ~352px */
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0,0,0,0.05);
`;

const ButtonStyled = styled.button`
  width: 100%;
  padding: 10px 16px;
  background-color: #34c759; /* Зеленый акцентный цвет Apple */
  color: white;
  font-size: 1.0625rem; /* 17px */
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  line-height: 1.5;
  margin-top: 0.5rem;

  &:hover {
    background-color: #2aa14a; /* Темнее при наведении */
  }

  &:active {
    background-color: #208a3b; /* Еще темнее при нажатии */
  }

  &:disabled {
    background-color: #c7c7cc;
    color: #8e8e93;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff3b30;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const registrationSchema = yup.object().shape({
  fullName: yup.string().required('Полное имя обязательно'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup.string().min(8, 'Пароль должен быть не менее 8 символов').required('Пароль обязателен'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
});

const RegistrationForm = () => {
  const { register: authRegister, error: authError, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const isFormSubmitting = authIsLoading;

  const onSubmit = async (data) => {
    const { confirmPassword, ...registrationPayload } = data;
    const result = await authRegister(registrationPayload.fullName, registrationPayload.email, registrationPayload.password);
    if (result.success) {
      navigate('/'); // Перенаправляем на главную после успешной регистрации
    }
  };

  return (
    <FormStyled onSubmit={handleSubmit(onSubmit)}>
      {authError && <ErrorMessage>{authError}</ErrorMessage>}
      <Input
        id="fullName"
        label="Полное имя"
        type="text"
        register={register('fullName')}
        error={errors.fullName}
        placeholder="Иван Иванов"
        disabled={isFormSubmitting}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        register={register('email')}
        error={errors.email}
        placeholder="you@example.com"
        disabled={isFormSubmitting}
      />
      <Input
        id="password"
        label="Пароль"
        type="password"
        register={register('password')}
        error={errors.password}
        placeholder="••••••••"
        disabled={isFormSubmitting}
      />
      <Input
        id="confirmPassword"
        label="Подтвердите пароль"
        type="password"
        register={register('confirmPassword')}
        error={errors.confirmPassword}
        placeholder="••••••••"
        disabled={isFormSubmitting}
      />
      <ButtonStyled type="submit" disabled={isFormSubmitting}>
        {isFormSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
      </ButtonStyled>
    </FormStyled>
  );
};

export default RegistrationForm; 