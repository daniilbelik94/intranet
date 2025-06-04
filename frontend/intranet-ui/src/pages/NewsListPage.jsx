import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { getAllNews, deleteNewsItem, getAllCategories } from '../features/news/services/newsService';
import { useAuth } from '../features/auth/context/AuthContext';
import Modal from '../components/common/Modal';
import EditNewsModal from '../features/news/components/EditNewsModal';
import Button from '../components/common/Button';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const PageContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--color-text-primary);
`;

const CreateNewsButton = styled(Link)`
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  background-color: var(--color-apple-green);
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #28a745;
  }
`;

const NewsList = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
`;

const NewsListItemStyled = styled.li`
  background-color: var(--color-background-elevated);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 7px 20px rgba(0,0,0,0.1);
  }
`;

const NewsImageContainer = styled.div`
  width: 100%;
  padding-top: 56.25%;
  position: relative;
  background-color: var(--color-background-secondary);
`;

const NewsImageStyled = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NewsCardContent = styled.div`
  padding: 18px 22px 22px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const NewsTitleLink = styled(Link)`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  text-decoration: none;
  &:hover {
    color: var(--color-apple-blue);
  }
`;

const NewsMetaStyled = styled.div`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const CategoryTag = styled.span`
  background-color: var(--color-apple-blue-light);
  color: var(--color-apple-blue);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 6px;
  &:last-child {
    margin-right: 0;
  }
`;

const StatusBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  &.published {
    background-color: var(--color-apple-green);
  }
  &.draft {
    background-color: var(--color-apple-gray-dark);
  }
`;

const NewsShortDescription = styled.p`
  font-size: 0.95rem;
  color: var(--color-text-primary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex-grow: 1;
  margin-bottom: 15px;
`;

const ReadMoreLink = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-apple-blue);
  text-decoration: none;
  margin-top: auto;
  cursor: pointer;
  display: inline-block;
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMessage = styled.p`
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 30px;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: var(--color-apple-red);
  text-align: center;
  padding: 30px;
  background-color: rgba(255, 59, 48, 0.1);
  border: 1px solid var(--color-apple-red);
  border-radius: 8px;
`;

const ModalNewsHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
`;

const ModalNewsTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  line-height: 1.3;
  word-break: break-word;
`;

const ModalNewsMeta = styled.div`
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 15px;
`;

const ModalNewsImage = styled.img`
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 25px;
`;

const ModalNewsContent = styled.div`
  font-size: 1.05rem;
  color: var(--color-text-primary);
  line-height: 1.75;
  white-space: pre-wrap;

  h1, h2, h3, h4, h5, h6 {
    color: var(--color-text-primary);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  p {
    margin-bottom: 1em;
  }
  a {
    color: var(--color-apple-blue);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  ul, ol {
    margin-left: 20px;
    margin-bottom: 1em;
  }
  blockquote {
    border-left: 3px solid var(--color-apple-gray-dark);
    padding-left: 15px;
    margin-left: 0;
    font-style: italic;
    color: var(--color-text-secondary);
  }
`;

const ModalActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-subtle);
`;

const ActionButton = styled(Button)`
  &.edit {
    /* Стили для кнопки редактирования, если нужны специфичные */
  }
  &.delete {
    background-color: var(--color-apple-red-light);
    color: var(--color-apple-red);
    &:hover {
        background-color: var(--color-apple-red);
        color: #fff;
    }
  }
`;

const NewsListPage = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState(null);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [itemToDeleteTitle, setItemToDeleteTitle] = useState("");

  const [allCategories, setAllCategories] = useState([]);

  const fetchNewsAndCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [newsData, categoriesData] = await Promise.all([
        getAllNews(token, 0, 100),
        getAllCategories(token)
      ]);
      setNewsItems(newsData.items || []);
      setAllCategories(categoriesData || []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить новости или категории.');
      console.error("Fetch news/categories error:", err);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchNewsAndCategories();
  }, [fetchNewsAndCategories]);

  const handleOpenDetailModal = (item) => {
    setSelectedNewsItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNewsItem(null);
  };

  const handleOpenEditModal = (item) => {
    setNewsToEdit(item);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setNewsToEdit(null);
  };

  const handleNewsUpdated = (updatedNewsItem) => {
    setNewsItems(prevItems => 
      prevItems.map(item => item.id === updatedNewsItem.id ? updatedNewsItem : item)
    );
    if (selectedNewsItem && selectedNewsItem.id === updatedNewsItem.id) {
      setSelectedNewsItem(updatedNewsItem);
    }
  };

  const handleDelete = (itemId, itemTitle) => {
    setItemToDeleteId(itemId);
    setItemToDeleteTitle(itemTitle || "эту новость");
    setIsDetailModalOpen(false);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDeleteId || !token) return;
    try {
      await deleteNewsItem(token, itemToDeleteId);
      setNewsItems(prevItems => prevItems.filter(item => item.id !== itemToDeleteId));
      setIsConfirmDeleteModalOpen(false);
      setItemToDeleteId(null);
      setItemToDeleteTitle("");
    } catch (err) {
      setError(err.message || 'Не удалось удалить новость.');
      console.error("Delete news error:", err);
      setIsConfirmDeleteModalOpen(false); 
    }
  };

  const cancelDelete = () => {
    setIsConfirmDeleteModalOpen(false);
    setItemToDeleteId(null);
    setItemToDeleteTitle("");
  };

  const renderNewsItemCard = (item) => {
    const imageUrl = item.cover_image_url
      ? (item.cover_image_url.startsWith('http') 
          ? item.cover_image_url 
          : `${import.meta.env.VITE_API_BASE_URL || ''}${item.cover_image_url}`)
      : null;
    
    const creationDate = format(parseISO(item.created_at), 'd MMM yyyy, HH:mm', { locale: ru });
    const publishedDate = item.status === 'published' && item.published_at 
        ? format(parseISO(item.published_at), 'd MMM yyyy', { locale: ru })
        : 'Не опубликовано';

    return (
      <NewsListItemStyled key={item.id}>
        {imageUrl && (
          <NewsImageContainer>
            <NewsImageStyled src={imageUrl} alt={item.title} />
          </NewsImageContainer>
        )}
        <NewsCardContent>
          <NewsTitleLink to={`#`} onClick={(e) => { e.preventDefault(); handleOpenDetailModal(item); }}>
            {item.title}
          </NewsTitleLink>
          <NewsMetaStyled>
            <MetaItem title={`Создано: ${creationDate}`}>🗓️ {creationDate}</MetaItem>
            <MetaItem title={item.status === 'published' ? `Опубликовано: ${publishedDate}` : 'Статус'}>
                {item.status === 'published' ? '✅' : '📝'} <StatusBadge className={item.status?.toLowerCase()}>{item.status || 'N/A'}</StatusBadge>
            </MetaItem>
          </NewsMetaStyled>
          {item.categories && item.categories.length > 0 && (
            <NewsMetaStyled style={{ marginBottom: '10px' }}>
              {item.categories.map(cat => <CategoryTag key={cat.id}>{cat.name}</CategoryTag>)}
            </NewsMetaStyled>
          )}
          <NewsShortDescription>
            {item.short_description || item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : '')} 
          </NewsShortDescription>
          <ReadMoreLink onClick={() => handleOpenDetailModal(item)}>
            Читать далее...
          </ReadMoreLink>
        </NewsCardContent>
      </NewsListItemStyled>
    );
  };

  if (isLoading) return <PageContainer><LoadingMessage>Загрузка новостей...</LoadingMessage></PageContainer>;

  return (
    <PageContainer>
      <PageHeader>
        <Title>Новости</Title>
        {user && user.is_superuser && (
          <CreateNewsButton to="/news/create">Создать новость</CreateNewsButton>
        )}
      </PageHeader>
      
      {error && (
        <ErrorMessage>
          Ошибка: {error} <button onClick={fetchNewsAndCategories}>Попробовать снова</button>
        </ErrorMessage>
      )}

      {newsItems.length === 0 && !isLoading && !error && (
        <p>Пока нет новостей для отображения.</p>
      )}
      
      <NewsList>
        {newsItems.map(item => renderNewsItemCard(item))}
      </NewsList>

      {selectedNewsItem && isDetailModalOpen && (
        <Modal 
            isOpen={isDetailModalOpen} 
            onClose={handleCloseDetailModal} 
            title="Детали новости"
            size="large"
        >
            <ModalNewsHeader>
                <ModalNewsTitle>{selectedNewsItem.title}</ModalNewsTitle>
                <ModalNewsMeta>
                    <span>Автор: {selectedNewsItem.author?.full_name || selectedNewsItem.author?.email || 'Неизвестен'}</span>
                    <span>Создано: {format(parseISO(selectedNewsItem.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                    {selectedNewsItem.status === 'published' && selectedNewsItem.published_at && 
                        (<span>Опубликовано: {format(parseISO(selectedNewsItem.published_at), 'd MMM yyyy', { locale: ru })}</span>)
                    }
                    <span>Статус: <StatusBadge className={selectedNewsItem.status?.toLowerCase()}>{selectedNewsItem.status || 'N/A'}</StatusBadge></span>
                </ModalNewsMeta>
                {selectedNewsItem.categories && selectedNewsItem.categories.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                        {selectedNewsItem.categories.map(cat => <CategoryTag key={cat.id}>{cat.name}</CategoryTag>)}
                    </div>
                )}
            </ModalNewsHeader>
            {selectedNewsItem.cover_image_url && 
                <ModalNewsImage 
                    src={selectedNewsItem.cover_image_url.startsWith('http') ? selectedNewsItem.cover_image_url : `${import.meta.env.VITE_API_BASE_URL || ''}${selectedNewsItem.cover_image_url}`}
                    alt={selectedNewsItem.title} 
                />
            }
            <ModalNewsContent dangerouslySetInnerHTML={{ __html: selectedNewsItem.content }} />
            
            {user && user.is_superuser && (
              <ModalActionsContainer>
                <ActionButton 
                    variant="secondary" 
                    onClick={() => handleOpenEditModal(selectedNewsItem)} 
                    className="edit"
                >
                  Редактировать
                </ActionButton>
                <ActionButton 
                    onClick={() => handleDelete(selectedNewsItem.id, selectedNewsItem.title)} 
                    className="delete"
                    variant="danger"
                >
                  Удалить
                </ActionButton>
              </ModalActionsContainer>
            )}
        </Modal>
      )}

      {isEditModalOpen && newsToEdit && (
        <EditNewsModal 
            isOpen={isEditModalOpen} 
            onClose={handleCloseEditModal} 
            newsItemData={newsToEdit} 
            onNewsUpdated={handleNewsUpdated}
            allCategories={allCategories}
        />
      )}

      <Modal 
        isOpen={isConfirmDeleteModalOpen}
        onClose={cancelDelete}
        title="Подтвердить удаление"
        size="small"
      >
        <p>Вы уверены, что хотите удалить новость "<strong>{itemToDeleteTitle}</strong>"?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button onClick={cancelDelete} variant="secondary" style={{ marginRight: '10px' }}>Отмена</Button>
          <Button onClick={confirmDelete} variant="danger">Удалить</Button>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default NewsListPage; 