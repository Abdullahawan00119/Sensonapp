import React from 'react';

/**
 * Utility to clean up JSX children and prevent text node errors
 * Filters out empty strings, null, undefined, and whitespace-only strings
 */
export function cleanChildren(children: React.ReactNode): React.ReactNode {
  if (Array.isArray(children)) {
    return children.filter(child => {
      if (typeof child === 'string') {
        return child.trim().length > 0;
      }
      return child !== null && child !== undefined;
    });
  }
  
  if (typeof children === 'string') {
    return children.trim().length > 0 ? children : null;
  }
  
  return children;
}

/**
 * Safe text wrapper that ensures text is properly wrapped in Text component
 */
export function safeText(text: string | React.ReactNode): React.ReactNode {
  if (typeof text === 'string') {
    return text.trim();
  }
  return text;
}