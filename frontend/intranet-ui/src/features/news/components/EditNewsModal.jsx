import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Modal from '../../../components/common/Modal'; // Путь к общему Modal
import NewsForm from './NewsForm'; // Путь к NewsForm
import { useAuth } from '../../auth/context/AuthContext'; // Путь к AuthContext
import { updateNewsItem, getAllCategories } from '../services/newsService'; // Путь к newsService, добавлен getAllCategories

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 25px;
  text-align: center;
`;

const LoadingErrorText = styled.p`
  color: var(--color-apple-red);
  text-align: center;
  font-size: 0.9rem;
`;

const EditNewsModal = ({ isOpen, onClose, newsItemData, onNewsUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { token } = useAuth();

  const [allCategories, setAllCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await getAllCategories(token);
      setAllCategories(data.items || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategoriesError(error.message || "Не удалось загрузить категории.");
    }
    setCategoriesLoading(false);
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      fetchCategories();
    }
  }, [isOpen, fetchCategories]); // fetchCategories добавлен в зависимости

  const handleFormSubmit = async (formDataFromNewsForm) => {
    if (!newsItemData || !newsItemData.id) {
      setServerError("Ошибка: ID новости для обновления не найден.");
      return;
    }
    if (!token) {
      setServerError("Ошибка аутентификации. Пожалуйста, войдите снова.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const finalPayload = {
        title: formDataFromNewsForm.title,
        content: formDataFromNewsForm.content,
        slug: formDataFromNewsForm.slug,
        short_description: formDataFromNewsForm.short_description,
        status: formDataFromNewsForm.status,
        category_ids: formDataFromNewsForm.selectedCategoryIds,
      };

      if (formDataFromNewsForm.coverImageFile) {
        finalPayload.coverImageFile = formDataFromNewsForm.coverImageFile;
      }
      if (formDataFromNewsForm.removeCoverImage) {
        finalPayload.removeCoverImage = formDataFromNewsForm.removeCoverImage;
      }

      const updatedNewsResponse = await updateNewsItem(token, newsItemData.id, finalPayload);

      onNewsUpdated(updatedNewsResponse);
      onClose();
    } catch (error) {
      console.error("Failed to update news item:", error);
      const errorMsg = error.message || 'Не удалось обновить новость. Попробуйте позже.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  console.log("[EditNewsModal] newsItemData:", newsItemData);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalTitle>Редактировать новость</ModalTitle>
      {categoriesError && <LoadingErrorText>Ошибка загрузки категорий: {categoriesError}</LoadingErrorText>}
      {newsItemData && !categoriesLoading && !categoriesError && (
        <NewsForm 
          onSubmitProp={handleFormSubmit}
          initialData={newsItemData}
          allCategories={allCategories}
          isSubmittingProp={isSubmitting}
          submitButtonText="Сохранить изменения"
          serverErrorProp={serverError}
          isEditMode={true}
        />
      )}
      {categoriesLoading && <LoadingErrorText>Загрузка категорий...</LoadingErrorText>}
    </Modal>
  );
};

export default EditNewsModal; 