import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { X } from 'lucide-react'; // Иконка крестика для закрытия

const MODAL_ANIMATION_DURATION = 300; // Milliseconds, should match CSS transition
// const MINIMAL_TIMEOUT_FOR_REFRAME = 10; // Not used with double rAF

// Глобальный стиль - теперь только для запрета прокрутки
const ModalGlobalStyle = createGlobalStyle`
  body.modal-open {
    overflow: hidden; /* Запрещаем прокрутку основной страницы */
    /* Удален filter: blur(5px) отсюда */
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Полупрозрачный фон для эффекта блюра */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.$active ? 1 : 0};
  visibility: ${props => props.$active ? 'visible' : 'hidden'};
  /* Delay visibility change on close to allow opacity to animate out */
  transition: opacity 0.3s ease-in-out, visibility 0s linear ${props => props.$active ? '0s' : '0.3s'};
  backdrop-filter: blur(5px); /* Применяем блюр к фону за оверлеем */
  -webkit-backdrop-filter: blur(5px); /* Для поддержки Safari */
`;

const getMaxWidth = (size) => {
  switch (size) {
    case 'small':
      return '450px';
    case 'large':
      return '1200px';
    case 'medium':
    default:
      return '900px';
  }
};

const ModalContentWrapper = styled.div`
  background-color: var(--color-background-elevated);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  max-width: ${props => getMaxWidth(props.$size)}; /* Используем функцию для установки max-width */
  width: 90%;
  max-height: 90vh; /* Максимальная высота */
  overflow-y: auto; /* Прокрутка для контента, если он не помещается */
  position: relative; /* Для позиционирования кнопки закрытия */
  opacity: ${props => props.$active ? 1 : 0};
  transform: ${props => props.$active ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.95)'};
  transition: opacity ${MODAL_ANIMATION_DURATION}ms ease-in-out, transform ${MODAL_ANIMATION_DURATION}ms ease-in-out;

  /* Стили для скроллбара внутри модалки */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent; 
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-apple-gray);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-apple-gray-dark);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease; /* Restored hover transition */

  &:hover {
    background-color: var(--color-background-hover);
    color: var(--color-text-primary);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Modal = ({ isOpen, onClose, children, size = 'medium' }) => {
  const [isModalInDOM, setIsModalInDOM] = useState(false);
  // Используем isMountedAndReadyToShow для управления активным состоянием анимации, как в "хорошем" примере
  const [isMountedAndReadyToShow, setIsMountedAndReadyToShow] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    let openTimerId = null;
    let unmountTimerId = null;

    if (isOpen) {
      // 1. Добавляем в DOM. isMountedAndReadyToShow пока false, поэтому скрыто стилями.
      setIsModalInDOM(true);

      // 2. Небольшая задержка перед активацией анимации, чтобы браузер успел обработать начальное состояние.
      openTimerId = setTimeout(() => {
        if (isOpen) { // Перепроверяем isOpen на случай быстрого переключения
          setIsMountedAndReadyToShow(true);
        }
      }, 10); // Небольшая задержка

      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleEsc);
    } else {
      // Для закрытия:
      // 1. Начинаем анимацию закрытия, устанавливая isMountedAndReadyToShow в false.
      setIsMountedAndReadyToShow(false);

      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleEsc);

      // 2. После завершения анимации удаляем модальное окно из DOM.
      unmountTimerId = setTimeout(() => {
        setIsModalInDOM(false);
      }, MODAL_ANIMATION_DURATION);
    }

    return () => {
      // Функция очистки
      window.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('modal-open');
      if (openTimerId) {
        clearTimeout(openTimerId);
      }
      if (unmountTimerId) {
        clearTimeout(unmountTimerId);
      }
      // Если компонент размонтируется или isOpen изменится во время закрытия,
      // убедимся, что isMountedAndReadyToShow сброшено.
      if (!isOpen) {
        setIsMountedAndReadyToShow(false);
      }
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isModalInDOM) {
    return null; // Не рендерим, если не в DOM
  }

  return (
    <>
      {/* ModalGlobalStyle теперь применяется всегда, но активен только при body.modal-open */}
      {/* Либо можно рендерить его условно: {isOpen && <ModalGlobalStyle />} или когда isOpen меняется */} 
      <ModalGlobalStyle /> 
      <ModalOverlay $active={isMountedAndReadyToShow} onClick={handleOverlayClick}>
        <ModalContentWrapper $active={isMountedAndReadyToShow} $size={size} role="dialog" aria-modal="true">
          <CloseButton onClick={onClose} aria-label="Закрыть модальное окно">
            <X />
          </CloseButton>
          {children}
        </ModalContentWrapper>
      </ModalOverlay>
    </>
  );
};

export default Modal; 