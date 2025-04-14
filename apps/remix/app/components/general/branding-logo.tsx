import { Link } from 'react-router';

import LogoImage from '@documenso/assets/logo.png';

export const BrandingLogo = ({ ...props }: { className?: string }) => {
  return (
    <Link to="/" {...props}>
      <img src={LogoImage} alt="Documenso Logo" className="dark:invert" width={170} height={25} />
    </Link>
  );
};
