import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --color-background: #f2f2f7; /* Light Gray - Common Apple background */
    --color-background-elevated: #ffffff; /* White - For elements like cards, modals */
    --color-text-primary: #1d1d1f;    /* Near Black - Primary text */
    --color-text-secondary: #6e6e73;  /* Gray - Secondary text */
    --color-text-placeholder: #c7c7cc; /* Lighter Gray - Placeholder text */
    --color-apple-blue: #007aff;      /* Apple Blue - Links, buttons, active states */
    --color-apple-green: #34c759;     /* Apple Green - Success states */
    --color-apple-red: #ff3b30;       /* Apple Red - Error states */
    --color-border: #d1d1d6;         /* Light Gray - Borders, dividers */
    --font-family-apple: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                 sans-serif;
  }

  /* Box sizing rules */
  *,*::before, *::after {
    box-sizing: border-box;
  }

  /* Remove default margin */
  body,
  h1, h2, h3, h4, h5, h6,
  p,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  /* Set core root defaults */
  html:focus-within {
    scroll-behavior: smooth;
  }

  /* Set core body defaults */
  body {
    min-height: 100vh;
    text-rendering: optimizeSpeed;
    line-height: 1.5;
    font-family: var(--font-family-apple);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }

  /* Make images easier to work with */
  img,
  picture {
    max-width: 100%;
    display: block;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  /* Remove all animations and transitions for people that prefer not to see them */
  @media (prefers-reduced-motion: reduce) {
    html:focus-within {
      scroll-behavior: auto;
    }
    
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Basic reset for links */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
  ul[role='list'],
  ol[role='list'] {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* More specific resets if needed */
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit; /* Позволяет управлять размерами через компоненты */
    font-weight: inherit; /* Позволяет управлять насыщенностью через компоненты */
  }
`;

export default GlobalStyles; 