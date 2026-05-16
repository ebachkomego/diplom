import { useCallback } from 'react';

export const usePagePrint = (title) => {
  return useCallback(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = title;
    }
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 200);
  }, [title]);
};
