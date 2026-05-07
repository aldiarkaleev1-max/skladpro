import React from 'react';

export function Header({ title }) {
  return (
    <header className="header">
      <h1 className="header-title">{title || 'Обзор'}</h1>
    </header>
  );
}
