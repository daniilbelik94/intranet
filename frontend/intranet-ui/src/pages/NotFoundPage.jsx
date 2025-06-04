import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  color: #ef4444; /* text-red-500 */
  margin-bottom: 1rem; /* mb-4 */
`;

const Message = styled.p`
  font-size: 1.125rem; /* text-lg */
  margin-bottom: 2rem; /* mb-8 */
`;

const StyledLink = styled(Link)`
  padding: 0.5rem 1.5rem; /* px-6 py-2 */
  background-color: #3b82f6; /* bg-blue-500 */
  color: white;
  border-radius: 0.25rem; /* rounded */
  text-decoration: none;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #2563eb; /* hover:bg-blue-600 */
  }
`;

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <Title>404 - Page Not Found</Title>
      <Message>Oops! The page you are looking for does not exist.</Message>
      <StyledLink to="/">Go to Homepage</StyledLink>
    </NotFoundContainer>
  );
};

export default NotFoundPage; 