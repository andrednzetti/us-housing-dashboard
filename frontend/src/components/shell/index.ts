/**
 * Barrel da casca do dashboard (header / footer / layout / marcas / stamps).
 *
 * Ponto único de import:
 *   import { AppLayout, Header, Footer, Stamp, DissenhaWordmark } from '../components/shell';
 *
 * Os componentes desta pasta são puramente visuais/estruturais — sem lógica
 * de domínio. O hook `useIndicatorsFile` vive em `src/hooks/` (separação de
 * concerns).
 */

export { AppLayout } from './app-layout';
export type { AppLayoutProps } from './app-layout';

export { Header } from './header';
export type { HeaderProps } from './header';

export { Footer } from './footer';
export type { FooterProps } from './footer';

export { Stamp } from './stamp';
export type { StampProps, StampVariant } from './stamp';

export { DissenhaWordmark, DissenhaSeal } from './dissenha-mark';
export type { DissenhaWordmarkProps, DissenhaSealProps } from './dissenha-mark';
