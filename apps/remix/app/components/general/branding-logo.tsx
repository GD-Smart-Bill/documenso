import LogoImage from '@documenso/assets/logo.png';

export const BrandingLogo = (props: { className?: string }) => {
  return (
    <img src={LogoImage} alt="Smartsign Logo" className={props.className} width={170} height={25} />
  );
};
