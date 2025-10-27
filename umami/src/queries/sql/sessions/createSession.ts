import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type CreateSessionOptions = {
  skipDuplicates?: boolean;
};

export async function createSession(
  data: Prisma.SessionUncheckedCreateInput,
  options: CreateSessionOptions = {},
) {
  try {
    return await prisma.client.session.create({
      data,
    });
  } catch (e: unknown) {
    if (
      options.skipDuplicates &&
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return null;
    }

    throw e;
  }
}
