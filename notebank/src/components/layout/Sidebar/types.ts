import { FC } from 'react';

export interface NavItem {
  path: string;
  label: string;
  icon: FC<{ className?: string }>;
}

export interface SidebarProps {
  /**
   * Additional navigation items to display
   * @default []
   */
  additionalNavItems?: NavItem[];
} 