declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react';

  interface ReactMarkdownProps {
    children: string;
    className?: string;
    components?: Record<string, ComponentType<{ children?: ReactNode; href?: string; className?: string }>>;
  }

  const ReactMarkdown: ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}
