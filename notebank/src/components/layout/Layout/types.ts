// src/components/layout/Layout/types.ts
import type { SidebarProps } from '../Sidebar/types';

export interface LayoutProps {
  sidebarProps?: SidebarProps;
  children?: React.ReactNode;
}