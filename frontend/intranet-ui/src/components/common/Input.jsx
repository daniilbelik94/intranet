import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px; /* Более компактные внутренние отступы */
  border: 1px solid #caced1; /* Более светлая и тонкая рамка, как у Apple */
  border-radius: 8px; /* Скругление в стиле Apple */
  font-size: 1rem; /* 16px, стандартный размер */
  line-height: 1.5;
  color: #1d1d1f; /* Основной цвет текста Apple */
  background-color: #ffffff;
  /* box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); Убираем тень для минимализма */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  appearance: none; /* Убираем стандартный вид в некоторых браузерах */

  &::placeholder {
    color: #86868b; /* Цвет плейсхолдера Apple */
  }

  &:focus {
    outline: none;
    border-color: #007aff; /* Синий акцентный цвет Apple */
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3); /* Мягкая тень фокуса Apple */
  }

  &.invalid {
    border-color: #ff3b30; /* Красный цвет ошибки Apple */
    box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.2); /* Тень ошибки */
  }

  &:disabled {
    background-color: #f2f2f7; /* Светло-серый фон для неактивных элементов Apple */
    color: #8e8e93;
    cursor: not-allowed;
    border-color: #dcdcdc; /* Нейтральная рамка для неактивных */
  }
`;

const InputErrorMessage = styled.p`
  color: #ff3b30; /* Красный цвет ошибки Apple */
  font-size: 0.8125rem; /* 13px */
  margin-top: 6px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.9375rem; /* 15px */
  font-weight: 400; /* Apple использует Regular (400) для лейблов часто */
  color: #3c3c43; /* Немного приглушенный черный */
  margin-bottom: 6px;
`;

const InputWrapper = styled.div`
  margin-bottom: 1.25rem; /* 20px, увеличенный отступ */
  width: 100%;
`;

const Input = ({ id, label, register, error, ...rest }) => {
  return (
    <InputWrapper>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <StyledInput id={id} {...register} {...rest} className={error ? 'invalid' : ''} />
      {error && <InputErrorMessage>{error.message}</InputErrorMessage>}
    </InputWrapper>
  );
};

export default Input; 