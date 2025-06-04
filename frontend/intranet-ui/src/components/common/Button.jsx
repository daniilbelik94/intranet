import React from 'react';
import styled, { css } from 'styled-components';

const StyledButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: var(--color-apple-blue); /* Основной цвет кнопки */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none; /* Если кнопка используется как ссылка */

  &:hover {
    background-color: var(--color-apple-blue-hover); /* Затемненный вариант для ховера */
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: var(--color-apple-gray);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }

  /* Варианты стилей, если понадобятся */
  ${props =>
    props.variant === 'secondary' &&
    css`
      background-color: var(--color-apple-gray-light);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      &:hover {
        background-color: var(--color-apple-gray);
      }
    `}

  ${props =>
    props.variant === 'danger' &&
    css`
      background-color: var(--color-apple-red);
      &:hover {
        background-color: #c82333; /* Затемненный красный */
      }
    `}
  
  ${props => 
    props.fullWidth && 
    css`
      width: 100%;
    `}
`;

const Button = ({ children, type = 'button', variant, fullWidth, disabled, onClick, ...props }) => {
  return (
    <StyledButton 
      type={type} 
      variant={variant} 
      fullWidth={fullWidth} 
      disabled={disabled} 
      onClick={onClick}
      {...props} /* Передаем остальные пропсы, например, для Link */
    >
      {children}
    </StyledButton>
  );
};

export default Button; 