import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { getInitials } from '@/shared';
import { useUser } from '@/entities';
import { Link } from 'react-router';
import { useSidebar } from '@/shadcn/components/ui/sidebar';

export const Profile = () => {
  const { user } = useUser();
  const { toggleSidebar } = useSidebar();

  const handleProfileClick = () => {
    toggleSidebar(); // Close the sidebar when profile is clicked
  };

  if (!user) {
    return null;
  }

  return (
    <Link to='/profile' className='block'>
      <div
        className='items-center justify-between w-full p-4 sm:p-5 lg:p-6 bg-card text-card-foreground shadow-lg rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-xl active:shadow-md cursor-pointer'
        onClick={handleProfileClick}
      >
        <div className='grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] lg:grid-cols-[5rem_1fr] items-center gap-3 sm:gap-4 lg:gap-5'>
          <Avatar className='h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20'>
            <AvatarImage src={''} />
            <AvatarFallback className='text-sm sm:text-base lg:text-xl'>
              {getInitials(user.display_name || '')}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-start min-w-0 overflow-hidden'>
            <h3
              data-testid='sidebar-profile-display-name'
              className='text-sm sm:text-base lg:text-lg font-semibold truncate text-foreground dark:text-foreground'
            >
              {user.display_name}
            </h3>
            <h5
              data-testid='sidebar-profile-email'
              className='text-xs sm:text-sm lg:text-base truncate w-full text-muted-foreground dark:text-muted-foreground'
            >
              {user.email}
            </h5>
          </div>
        </div>
      </div>
    </Link>
  );
};
