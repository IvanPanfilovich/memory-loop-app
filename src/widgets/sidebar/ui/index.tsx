import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shadcn/components/ui/sidebar';
import { X, Crown, LayoutDashboard, HelpCircle } from 'lucide-react';
import { Profile } from './profile';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSignInDialog } from '@/contexts/SignInDialogContext';
import { cn } from '@/lib/utils';

export { Profile } from './profile';

export const AppSidebar = () => {
  const { t } = useTranslation();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { openSignInDialog } = useSignInDialog();
  const navigate = useNavigate();

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openSignInDialog();
      toggleSidebar();
    } else {
      navigate('/dashboard');
      toggleSidebar();
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className='p-4 sm:p-6 lg:p-8'>
        <div className='w-full flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 min-w-0'>
          <a
            href='/'
            className='text-2xl sm:text-3xl lg:text-4xl font-bold break-words leading-tight min-w-0 flex-1'
            onClick={e => {
              e.preventDefault();
              toggleSidebar();
              // Use full page reload
              window.location.href = '/';
            }}
          >
            {t('sidebar.brand')}
          </a>

          <X
            className='cursor-pointer flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7'
            onClick={toggleSidebar}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleDashboardClick}
                  className={cn(!user ? 'opacity-50' : '', 'gap-4')}
                >
                  <LayoutDashboard className='w-16 h-16' />
                  <span className='text-2xl font-semibold'>
                    {t('sidebar.dashboard', 'Dashboard')}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className='gap-4'>
                  <Link to='/paywall' onClick={toggleSidebar}>
                    <Crown className='w-16 h-16' />
                    <span className='text-2xl font-semibold'>
                      {t('sidebar.upgradeToPremium', 'Upgrade to premium')}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className='gap-4'>
                  <Link to='/faq' onClick={toggleSidebar}>
                    <HelpCircle className='w-16 h-16' />
                    <span className='text-2xl font-semibold'>{t('sidebar.faq', 'FAQ')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter
        data-testid='sidebar-profile-button'
        className='px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 lg:pt-6 pb-6 sm:pb-7 lg:pb-8 flex flex-col gap-4 sm:gap-5 lg:gap-6'
      >
        {user && <Profile />}
      </SidebarFooter>
    </Sidebar>
  );
};
