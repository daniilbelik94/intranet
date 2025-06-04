import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { createNewsItem, getAllCategories } from '../features/news/services/newsService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const PageContainer = styled.div`
  max-width: 700px;
  margin: 40px auto;
  padding: 30px;
  background-color: var(--color-background-elevated);
  border-radius: 12px;
  box-shadow: var(--shadow-large);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 30px;
`;

const FormStyled = styled.form`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  & > * {
    flex: 1;
  }
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FieldSet = styled.fieldset`
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  legend {
    padding: 0 10px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-input-background);
  color: var(--color-text-input);
  min-height: 120px;
  resize: vertical;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--color-apple-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
  }

  &::placeholder {
    color: var(--color-text-placeholder);
  }
`;

const SelectStyled = styled.select`
  padding: 12px 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-input-background);
  color: var(--color-text-input);
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--color-apple-blue);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
  }
`;

const FileInputLabel = styled.label`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
  display: block;
`;

const FileInputStyled = styled.input`
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-input-background);
  color: var(--color-text-input);
  cursor: pointer;

  &::file-selector-button {
    padding: 8px 15px;
    margin-right: 10px;
    border-radius: 6px;
    border: none;
    background-color: var(--color-apple-gray-light);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: var(--color-apple-gray);
    }
  }
`;

const ErrorMessage = styled.p`
  color: var(--color-apple-red);
  font-size: 0.85rem;
`;

const SubmitButton = styled(Button)`
  margin-top: 10px;
`;

const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
  object-fit: cover;
  border: 1px solid var(--color-border);
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
`;

const CategoryCheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--color-background-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  input[type="checkbox"] {
    accent-color: var(--color-apple-blue);
  }

  &:hover {
    background-color: var(--color-background-hover);
  }
`;

const newsSchema = yup.object().shape({
  title: yup.string().required('Заголовок обязателен').min(5, 'Минимум 5 символов'),
  content: yup.string().required('Содержание обязательно').min(20, 'Минимум 20 символов'),
  slug: yup.string()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug может содержать только латинские буквы, цифры и дефисы')
    .optional()
    .nullable(),
  short_description: yup.string().max(500, 'Краткое описание не должно превышать 500 символов').optional().nullable(),
  status: yup.string().oneOf(['draft', 'published'], 'Неверный статус').required('Статус обязателен'),
});

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

const CreateNewsPage = () => {
  const navigate = useNavigate();
  const { token, user, isLoading: authIsLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authIsLoading && isAuthenticated && user && !user.is_superuser) {
      alert('У вас нет прав для создания новостей. Вы будете перенаправлены.');
      navigate('/news');
    } else if (!authIsLoading && !isAuthenticated) {
        navigate('/login');
    }
  }, [user, authIsLoading, isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(newsSchema),
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      short_description: '',
      status: 'draft',
    }
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [serverError, setServerError] = useState('');
  
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const categoriesData = await getAllCategories(token);
      setAllCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.items || []);
    } catch (error) {
      console.error("Failed to fetch categories for create page:", error);
      setServerError('Не удалось загрузить категории.')
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && user?.is_superuser) {
        fetchCategories();
    }
  }, [fetchCategories, isAuthenticated, user]);

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setCoverImageFile(null);
      setPreviewImageUrl(null);
    }
  };

  const generateSlugFromTitle = () => {
    const titleValue = watch('title');
    if (titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const onSubmit = async (data) => {
    if (!token || !user?.is_superuser) {
      setServerError('Ошибка прав доступа или аутентификации. Пожалуйста, войдите снова как администратор.');
      return;
    }
    setServerError('');

    try {
      const newsDataPayload = { 
        title: data.title, 
        content: data.content, 
        slug: data.slug,
        short_description: data.short_description,
        status: data.status, 
        category_ids: selectedCategoryIds,
        coverImageFile: coverImageFile,
      };
      await createNewsItem(token, newsDataPayload);
      navigate('/news');
    } catch (error) {
      console.error("Failed to create news item:", error);
      setServerError(error.message || 'Произошла ошибка при создании новости.');
    }
  };

  if (authIsLoading || (!isAuthenticated && !authIsLoading) || (isAuthenticated && user && !user.is_superuser)) {
    return <PageContainer><p>Проверка прав доступа...</p></PageContainer>;
  }

  return (
    <PageContainer>
      <Title>Создать новость</Title>
      {serverError && <ErrorMessage style={{ marginBottom: '20px', textAlign: 'center' }}>{serverError}</ErrorMessage>}
      <FormStyled onSubmit={handleSubmit(onSubmit)}>
        <FormRow>
          <Input
            label="Заголовок"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Введите заголовок новости"
          />
          <div style={{ flex: '0.7' }}>
            <Input
              label="Slug (URL)"
              {...register('slug')}
              error={errors.slug?.message}
              placeholder="my-awesome-news-slug (автоматически или вручную)"
            />
            <Button type="button" onClick={generateSlugFromTitle} variant="outline" size="small" style={{ marginTop: '5px'}}>
              Сгенерировать Slug
            </Button>
          </div>
        </FormRow>

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextArea 
                {...field} 
                placeholder="Введите полное содержание новости (можно использовать Markdown)"
            />
          )}
        />
        {errors.content && <ErrorMessage>{errors.content.message}</ErrorMessage>}

        <TextArea
          label="Краткое описание (до 500 симв.)"
          {...register('short_description')}
          placeholder="Введите краткое описание для анонса"
          rows={3}
        />
        {errors.short_description && <ErrorMessage>{errors.short_description.message}</ErrorMessage>}
        
        <FormRow>
            <div>
                <FileInputLabel htmlFor="status">Статус</FileInputLabel>
                <SelectStyled id="status" {...register('status')}>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовать</option>
                </SelectStyled>
                {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
            </div>
            <div>
                <FileInputLabel htmlFor="coverImageFile">Обложка новости</FileInputLabel>
                <FileInputStyled 
                    type="file" 
                    id="coverImageFile"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleCoverImageChange} 
                />
                {previewImageUrl && <ImagePreview src={previewImageUrl} alt="Предпросмотр обложки" />}
            </div>
        </FormRow>

        {allCategories.length > 0 && (
          <FieldSet>
            <legend>Категории</legend>
            <CategoriesContainer>
              {allCategories.map(category => (
                <CategoryCheckboxItem key={category.id}>
                  <input 
                    type="checkbox" 
                    id={`category-${category.id}`}
                    value={category.id}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  {category.name}
                </CategoryCheckboxItem>
              ))}
            </CategoriesContainer>
          </FieldSet>
        )}

        <SubmitButton type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? 'Создание...' : 'Создать новость'}
        </SubmitButton>
      </FormStyled>
    </PageContainer>
  );
};

export default CreateNewsPage; 