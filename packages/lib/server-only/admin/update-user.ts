import type { Role } from '@prisma/client';

import { prisma } from '@documenso/prisma';

export type UpdateUserOptions = {
  id: number;
  name: string | null | undefined;
  email: string | undefined;
  roles: Role[] | undefined;
  documentsLimit: number | null | undefined;
};

export const updateUser = async ({ id, name, email, roles, documentsLimit }: UpdateUserOptions) => {
  await prisma.user.findFirstOrThrow({
    where: {
      id,
    },
  });

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      roles,
      documentsLimit,
    },
  });
};
