import { Link } from 'react-router-dom';
import styled from 'styled-components';

const LinkWrapper = styled.div`
  margin-top: 1.5rem; /* 24px */
  text-align: center;
`;

const StyledLink = styled(Link)`
  font-size: 0.9375rem; /* 15px */
  color: #007aff; /* Синий акцентный Apple */
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const AuthFormLink = ({ to, children }) => {
  return (
    <LinkWrapper>
      <StyledLink to={to}>{children}</StyledLink>
    </LinkWrapper>
  );
};

export default AuthFormLink; 