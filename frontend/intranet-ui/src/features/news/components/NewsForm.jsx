import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

// Стили, перенесенные и адаптированные из CreateNewsPage
const FormStyled = styled.form`
  display: flex;
  flex-direction: column;
  gap: 22px; // Increased gap
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
  min-height: 120px; // Adjusted height
  resize: vertical;
  width: 100%; // Ensure full width

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
  /* margin-top: -10px; // Убрано, чтобы было более универсально */
  /* margin-bottom: 5px; // Убрано */
`;

const SubmitButton = styled(Button)`
  margin-top: 10px;
`;

const CurrentImagePreview = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  margin-bottom: 10px;
  object-fit: cover;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  margin-bottom: 10px;

  label {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    cursor: pointer;
  }
  input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: var(--color-apple-blue);
  }
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
`;

const CategoryCheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  label {
    font-size: 0.95rem;
    color: var(--color-text-primary);
    cursor: pointer;
  }
  input[type="checkbox"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: var(--color-apple-blue);
  }
`;

const newsSchema = yup.object().shape({
  title: yup.string().required('Заголовок обязателен').min(5, 'Заголовок должен быть не менее 5 символов'),
  content: yup.string().required('Содержание обязательно').min(20, 'Содержание должно быть не менее 20 символов'),
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
    .replace(/\s+/g, '-') // Заменить пробелы на -
    .replace(/[^\w-]+/g, '') // Удалить все не-буквенно-цифровые символы, кроме -
    .replace(/--+/g, '-'); // Заменить несколько - на один -

const NewsForm = ({ 
  onSubmitProp, 
  initialData = null, 
  allCategories = [],
  isSubmittingProp = false, 
  submitButtonText = "Отправить",
  serverErrorProp = null,
  isEditMode = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control
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

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [removeCoverImageFlag, setRemoveCoverImageFlag] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        content: initialData.content || '',
        slug: initialData.slug || '',
        short_description: initialData.short_description || '',
        status: initialData.status || 'draft',
      });
      setSelectedCategoryIds(initialData.categories ? initialData.categories.map(cat => cat.id) : []);
      setPreviewImageUrl(initialData.cover_image_url || null);
      setCoverImageFile(null);
      setRemoveCoverImageFlag(false);
    } else {
      // Режим создания
      reset({ title: '', content: '', slug: '', short_description: '', status: 'draft' });
      setSelectedCategoryIds([]);
      setPreviewImageUrl(null);
      setCoverImageFile(null);
      setRemoveCoverImageFlag(false);
    }
  }, [initialData, reset]);

  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
      setRemoveCoverImageFlag(false); // Сбросить флаг удаления, если выбран новый файл
    } else {
      // Если файл отменен, но был initialData.cover_image_url, вернуть его
      setCoverImageFile(null);
      setPreviewImageUrl(initialData?.cover_image_url || null);
    }
  };

  const handleRemoveCoverImageToggle = () => {
    const newFlagState = !removeCoverImageFlag;
    setRemoveCoverImageFlag(newFlagState);
    if (newFlagState) {
      setCoverImageFile(null); // Если удаляем, то новый файл не нужен
      setPreviewImageUrl(null); // И превью тоже
    }
     else {
        // Если сняли флаг, вернуть превью исходного изображения, если оно было
        setPreviewImageUrl(initialData?.cover_image_url || null);
    }
  };
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const generateSlugFromTitle = () => {
    const titleValue = watch('title');
    if (titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  };

  const onFormSubmitInternal = (data) => {
    onSubmitProp({
      ...data, // title, content, slug, short_description, status
      selectedCategoryIds: selectedCategoryIds,
      coverImageFile: coverImageFile,
      // Отправляем флаг, только если он true, есть что удалять и не выбран новый файл
      removeCoverImage: removeCoverImageFlag && initialData?.cover_image_url && !coverImageFile, 
    });
  };
  
  const displayImageUrl = coverImageFile ? previewImageUrl : (removeCoverImageFlag ? null : previewImageUrl);

  return (
    <FormStyled onSubmit={handleSubmit(onFormSubmitInternal)}>
      <Input
        label="Заголовок *"
        {...register('title')}
        error={errors.title?.message}
        disabled={isSubmittingProp}
      />
      <FormRow>
        <Input
            label="Slug (генерируется из заголовка, если пуст)"
            {...register('slug')}
            error={errors.slug?.message}
            disabled={isSubmittingProp}
        />
        <Button type="button" onClick={generateSlugFromTitle} disabled={isSubmittingProp} style={{ alignSelf: 'flex-end', height: '48px' }}>
            Сгенерировать Slug
        </Button>
      </FormRow>

      <div>
        <FileInputLabel htmlFor="short_description">Краткое описание (до 500 симв.)</FileInputLabel>
        <TextArea
          {...register('short_description')}
          rows={3}
          disabled={isSubmittingProp}
        />
        {errors.short_description && <ErrorMessage>{errors.short_description.message}</ErrorMessage>}
      </div>

      <div>
        <FileInputLabel htmlFor="content">Содержание *</FileInputLabel>
        {/* TODO: Заменить на WYSIWYG редактор */} 
        <Controller
            name="content"
            control={control}
            render={({ field }) => (
                <TextArea
                    {...field}
                    rows={8}
                    disabled={isSubmittingProp}
                />
            )}
        />
        {errors.content && <ErrorMessage>{errors.content.message}</ErrorMessage>}
      </div>

      <FormRow>
        <div>
          <FileInputLabel htmlFor="status">Статус *</FileInputLabel>
          <SelectStyled {...register('status')} disabled={isSubmittingProp}>
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
          </SelectStyled>
          {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
        </div>

        <FieldSet>
            <legend>Категории</legend>
            {allCategories.length > 0 ? (
                <CategoriesContainer>
                {allCategories.map(category => (
                    <CategoryCheckboxItem key={category.id}>
                    <input 
                        type="checkbox" 
                        id={`category-${category.id}`} 
                        value={category.id}
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        disabled={isSubmittingProp}
                    />
                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                    </CategoryCheckboxItem>
                ))}
                </CategoriesContainer>
            ) : (
                <p style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>Нет доступных категорий.</p>
            )}
        </FieldSet>
      </FormRow>

      <FieldSet>
        <legend>Обложка</legend>
        {displayImageUrl && (
          <CurrentImagePreview src={displayImageUrl} alt="Превью обложки" />
        )}
        {isEditMode && initialData?.cover_image_url && !coverImageFile && (
          <CheckboxContainer>
            <input 
              type="checkbox" 
              id="removeCoverImageFlag" 
              checked={removeCoverImageFlag}
              onChange={handleRemoveCoverImageToggle} // Используем новый обработчик
              disabled={isSubmittingProp}
            />
            <label htmlFor="removeCoverImageFlag">Удалить текущую обложку</label>
          </CheckboxContainer>
        )}
        {/* Поле для загрузки файла становится невидимым, если отмечено "удалить" и нет нового файла */}
        {(!removeCoverImageFlag || coverImageFile) && (
          <FileInputStyled 
            type="file" 
            id="coverImageFile" 
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleCoverImageChange}
            disabled={isSubmittingProp}
          />
        )}
      </FieldSet>
      
      {serverErrorProp && <ErrorMessage>{serverErrorProp}</ErrorMessage>}

      <SubmitButton type="submit" disabled={isSubmittingProp}>
        {isSubmittingProp ? 'Обработка...' : submitButtonText}
      </SubmitButton>
    </FormStyled>
  );
};

export default NewsForm; 