import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'; // useNavigate может понадобиться для программной навигации
import { getMyNews, deleteNewsItem } from '../features/news/services/newsService';
import { useAuth } from '../features/auth/context/AuthContext';
import Modal from '../components/common/Modal';
import EditNewsModal from '../features/news/components/EditNewsModal';
import Button from '../components/common/Button';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
// Импортируем стилизованные компоненты со страницы NewsListPage для переиспользования, если необходимо
// или создадим свои/адаптируем существующие. Пока для простоты скопируем часть.

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
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const NewsImageContainer = styled.div`
  width: 100%;
  padding-top: 56.25%;
  position: relative;
  background-color: var(--color-background-secondary);
  cursor: pointer;
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

const NewsTitleText = styled.h2` // Используем h2 вместо Link, т.к. клик может быть на карточке
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  cursor: pointer;
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

const MetaItem = styled.span` /* ... */ `;
const CategoryTag = styled.span` /* ... */ `;
const StatusBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  text-transform: capitalize;
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

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto; // Прижимает кнопки вниз
  padding-top: 15px;
  border-top: 1px solid var(--color-border-subtle);
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
  border: 1px solid transparent;

  &.edit {
    background-color: var(--color-apple-blue-light);
    color: var(--color-apple-blue);
    &:hover { background-color: var(--color-apple-blue); color: #fff; }
  }
  &.delete {
    background-color: var(--color-apple-red-light);
    color: var(--color-apple-red);
    &:hover { background-color: var(--color-apple-red); color: #fff; }
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const LoadingMessage = styled.p` /* ... */ `;
const ErrorMessage = styled.p` /* ... */ `;

// Модальное окно для деталей новости (если решим его использовать и здесь)
// ...

const MyNewsPage = () => {
  const [myNewsItems, setMyNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  // Состояния для модальных окон
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  const [itemToDeleteTitle, setItemToDeleteTitle] = useState(""); // Для модалки подтверждения удаления
  
  // Состояние для детального просмотра (если нужно)
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const [selectedNewsItem, setSelectedNewsItem] = useState(null);


  const fetchMyNews = useCallback(async () => {
    if (!token) {
      setError("Требуется аутентификация.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyNews(token, 0, 100); // Пока без пагинации, загружаем до 100
      setMyNewsItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить ваши новости.');
      console.error("Fetch my news error:", err);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    fetchMyNews();
  }, [fetchMyNews]);

  const handleOpenEditModal = (item) => {
    setNewsToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setNewsToEdit(null);
  };

  const handleNewsUpdated = (updatedNewsItem) => {
    // Обновляем список после редактирования
    setMyNewsItems(prevItems => 
      prevItems.map(item => item.id === updatedNewsItem.id ? updatedNewsItem : item)
    );
    // fetchMyNews(); // Или просто обновляем измененный элемент
  };

  const handleDelete = (itemId, itemTitle) => {
    setItemToDeleteId(itemId);
    setItemToDeleteTitle(itemTitle || "эту новость");
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDeleteId || !token) return;
    try {
      await deleteNewsItem(token, itemToDeleteId);
      setMyNewsItems(prevItems => prevItems.filter(item => item.id !== itemToDeleteId));
      setIsConfirmDeleteModalOpen(false);
      setItemToDeleteId(null);
      setItemToDeleteTitle("");
    } catch (err) {
      setError(err.message || 'Не удалось удалить новость.');
      console.error("Delete news error:", err);
      // Возможно, стоит закрыть модалку подтверждения и тут
      setIsConfirmDeleteModalOpen(false); 
    }
  };

  const cancelDelete = () => {
    setIsConfirmDeleteModalOpen(false);
    setItemToDeleteId(null);
    setItemToDeleteTitle("");
  };
  
  // Функция для открытия модального окна деталей (если будем его использовать)
  // const handleOpenDetailModal = (item) => {
  //   setSelectedNewsItem(item);
  //   setIsDetailModalOpen(true);
  // };
  // const handleCloseDetailModal = () => { /* ... */ };

  const renderNewsItemCard = (item) => {
    const imageUrl = item.cover_image_url
      ? (item.cover_image_url.startsWith('http') 
          ? item.cover_image_url 
          : \`\${import.meta.env.VITE_API_BASE_URL || ''}\${item.cover_image_url}\`)
      : null;
    
    const creationDate = format(parseISO(item.created_at), 'd MMM yyyy, HH:mm', { locale: ru });
    const publishedDate = item.status === 'published' && item.published_at 
        ? format(parseISO(item.published_at), 'd MMM yyyy', { locale: ru })
        : null;

    return (
      <NewsListItemStyled key={item.id}>
        {imageUrl && (
          <NewsImageContainer /* onClick={() => handleOpenDetailModal(item)} */ >
            <NewsImageStyled src={imageUrl} alt={item.title} />
          </NewsImageContainer>
        )}
        <NewsCardContent>
          <NewsTitleText /* onClick={() => handleOpenDetailModal(item)} */ >
            {item.title}
          </NewsTitleText>
          <NewsMetaStyled>
            <MetaItem title={`Создано: ${creationDate}`}>🗓️ {creationDate}</MetaItem>
            {publishedDate && <MetaItem title={\`Опубликовано: ${publishedDate}\`}>✅ {publishedDate}</MetaItem>}
            <MetaItem>
                Статус: <StatusBadge className={item.status?.toLowerCase()}>{item.status || 'N/A'}</StatusBadge>
            </MetaItem>
          </NewsMetaStyled>
          {item.categories && item.categories.length > 0 && (
            <NewsMetaStyled style={{ marginBottom: '10px' }}>
              {item.categories.map(cat => <CategoryTag key={cat.id}>{cat.name}</CategoryTag>)}
            </NewsMetaStyled>
          )}
          <NewsShortDescription /* onClick={() => handleOpenDetailModal(item)} */ >
            {item.short_description || item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : '')} 
          </NewsShortDescription>
          <CardActions>
            <ActionButton className="edit" onClick={() => handleOpenEditModal(item)}>
              Редактировать
            </ActionButton>
            <ActionButton className="delete" onClick={() => handleDelete(item.id, item.title)}>
              Удалить
            </ActionButton>
          </CardActions>
        </NewsCardContent>
      </NewsListItemStyled>
    );
  };

  if (isLoading) return <PageContainer><LoadingMessage>Загрузка ваших новостей...</LoadingMessage></PageContainer>;

  return (
    <PageContainer>
      <PageHeader>
        <Title>Мои новости</Title>
        {user && user.is_superuser && (
            <Link to="/news/create" style={{ textDecoration: 'none' }}>
                <Button variant="primary">Создать новость</Button>
            </Link>
        )}
      </PageHeader>
      
      {error && (
        <ErrorMessage>
          Ошибка: {error} <button onClick={fetchMyNews}>Попробовать снова</button>
        </ErrorMessage>
      )}

      {myNewsItems.length === 0 && !isLoading && !error && (
        <p>
          У вас пока нет новостей. 
          {user && user.is_superuser && <Link to="/news/create">Создайте свою первую новость!</Link>}
          {!user?.is_superuser && "Обратитесь к администратору для создания новости."}
        </p>
      )}
      
      <NewsList>
        {myNewsItems.map(item => renderNewsItemCard(item))}
      </NewsList>

      {isEditModalOpen && newsToEdit && (
        <EditNewsModal 
            isOpen={isEditModalOpen} 
            onClose={handleCloseEditModal} 
            newsItemData={newsToEdit} // Убедитесь, что проп называется newsItemData
            onNewsUpdated={handleNewsUpdated} 
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
      
      {/* Модальное окно для деталей новости, если нужно */}
      {/* {selectedNewsItem && isDetailModalOpen && ( ... ) } */}

    </PageContainer>
  );
};

export default MyNewsPage; 