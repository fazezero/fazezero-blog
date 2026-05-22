export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export const authors: Author[] = [
  {
    id: 'fazezero-editorial',
    name: 'FazeZero Editorial Team',
    role: 'Editorial',
    bio: 'Institutional insights on digital finance, stablecoins, and tokenization from the FazeZero team.',
  },
];

export const defaultAuthorId = 'fazezero-editorial';

export function getAuthorById(id: string): Author | undefined {
  return authors.find((author) => author.id === id);
}

export function getDefaultAuthor(): Author {
  return authors[0];
}
