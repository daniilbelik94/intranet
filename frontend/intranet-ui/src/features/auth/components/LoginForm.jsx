import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import Input from '../../../components/common/Input'; // Путь к общему Input
import { useAuth } from '../context/AuthContext'; // Импортируем useAuth
import { useNavigate } from 'react-router-dom'; // Для перенаправления

const Form = styled.form`
  width: 100%;
  max-width: 22rem; /* Немного уменьшил для более компактного вида ~352px */
  padding: 2rem; 
  background-color: #ffffff;
  border-radius: 12px; /* Более выраженное скругление Apple */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 1px 3px rgba(0,0,0,0.05); /* Мягкая тень */
`;

const Button = styled.button`
  width: 100%;
  padding: 10px 16px;
  background-color: #007aff; /* Синий акцентный цвет Apple */
  color: white;
  font-size: 1.0625rem; /* 17px, стандартный для кнопок Apple */
  font-weight: 500; /* Medium */
  border: none;
  border-radius: 8px; /* Скругление в стиле Apple */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  line-height: 1.5;

  &:hover {
    background-color: #005ecb; /* Более темный синий при наведении */
  }

  &:active {
    background-color: #004bad; /* Еще темнее при нажатии */
  }

  &:disabled {
    background-color: #c7c7cc; /* Серый для неактивных кнопок Apple */
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

const loginSchema = yup.object().shape({
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup.string().min(6, 'Пароль должен быть не менее 6 символов').required('Пароль обязателен'),
});

const LoginForm = () => {
  const { login, error: authError, isLoading: authIsLoading } = useAuth(); // Используем useAuth
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const isFormSubmitting = authIsLoading; // Общее состояние загрузки

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/'); // Перенаправляем на главную после успешного входа
    } 
    // Ошибка будет отображена через authError
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {authError && <ErrorMessage>{authError}</ErrorMessage>}
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
      <Button type="submit" disabled={isFormSubmitting}>
        {isFormSubmitting ? 'Вход...' : 'Войти'}
      </Button>
    </Form>
  );
};

export default LoginForm; 