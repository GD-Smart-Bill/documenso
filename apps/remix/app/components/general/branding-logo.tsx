import LogoImage from '@documenso/assets/logo.png';
import { cn } from '@documenso/ui/lib/utils';

export const BrandingLogo = (props: { className?: string }) => {
  return (
    <img
      src={LogoImage}
      alt="Smartsign Logo"
      className={cn('dark:invert', props.className)}
      width={170}
      height={25}
    />
  );
};
