import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';

import { Body, Container, Head, Html, Img, Preview, Section, Text } from '../components';
import { useBranding } from '../providers/branding';
import { TemplateFooter } from '../template-components/template-footer';

export const NewUserSignedUpEmailToAdminTemplate = ({
  assetBaseUrl = 'http://localhost:3002',
  user,
}: {
  assetBaseUrl: string;
  user: {
    email: string;
    name: string;
  };
}) => {
  const { _ } = useLingui();
  const branding = useBranding();

  const previewText = msg`New user signed up`;

  const getAssetUrl = (path: string) => {
    return new URL(path, assetBaseUrl).toString();
  };

  return (
    <Html>
      <Head />
      <Preview>{_(previewText)}</Preview>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Section>
          <Container className="mx-auto mb-2 mt-8 max-w-xl rounded-lg border border-solid border-slate-200 p-4 backdrop-blur-sm">
            <Section>
              {branding.brandingEnabled && branding.brandingLogo ? (
                <Img src={branding.brandingLogo} alt="Branding Logo" className="mb-4 h-6" />
              ) : (
                <Img
                  src={getAssetUrl('/static/logo.png')}
                  alt="Documenso Logo"
                  className="mb-4 h-6"
                />
              )}

              <Text className="my-1 text-center text-base text-slate-400">
                <Trans>A new user has signed up.</Trans>
              </Text>
              <Text className="my-1 text-center text-base text-slate-400">
                <Trans>Email:</Trans> {user.email}
              </Text>
              <Text className="my-1 text-center text-base text-slate-400">
                <Trans>Name:</Trans> {user.name}
              </Text>
            </Section>
          </Container>
          <div className="mx-auto mt-12 max-w-xl" />

          <Container className="mx-auto max-w-xl">
            <TemplateFooter isDocument={false} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

export default NewUserSignedUpEmailToAdminTemplate;
