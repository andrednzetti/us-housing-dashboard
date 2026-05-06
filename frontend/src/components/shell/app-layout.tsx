/**
 * AppLayout — container raiz do dashboard.
 *
 * Estrutura vertical:
 *   [header]
 *   <main>...</main>      (min-height impede footer subir em loading state)
 *   [footer]
 *
 * Largura máxima 1280px (token `--container-max`) centralizado, com fundo
 * `--bg`. Header e Footer recebem o `width: 100%` da banda — o `max-width`
 * é aplicado em torno do `<main>` da Fase 4 em diante quando montarmos o
 * KPI Quadro, Spotlight, Ledger e Anexos.
 *
 * Acessibilidade: usa `<main>` semântico para o conteúdo principal, o que
 * permite que leitores de tela pulem direto para o miolo.
 *
 * @example
 *   <AppLayout
 *     header={<Header generatedAt={data?.generatedAt} />}
 *     footer={<Footer generatedAt={data?.generatedAt} />}
 *   >
 *     {dashboardContent}
 *   </AppLayout>
 */

import type { CSSProperties, JSX, ReactNode } from 'react';

const rootStyle: CSSProperties = {
  background: 'var(--bg)',
  color: 'var(--ink)',
  minHeight: '100vh',
  fontFamily: 'var(--font-sans)',
  display: 'flex',
  flexDirection: 'column',
};

const mainStyle: CSSProperties = {
  flex: 1,
  minHeight: '60vh',
  width: '100%',
  maxWidth: 'var(--container-max)',
  margin: '0 auto',
  padding: 'var(--space-8) var(--space-12)',
  boxSizing: 'border-box',
};

export interface AppLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function AppLayout({ header, footer, children }: AppLayoutProps): JSX.Element {
  return (
    <div style={rootStyle}>
      {header}
      <main style={mainStyle}>{children}</main>
      {footer}
    </div>
  );
}
