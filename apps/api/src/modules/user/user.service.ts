import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  list(query?: string) {
    return this.prisma.user.findMany({
      where: query
        ? { OR: [{ email: { contains: query } }, { nickname: { contains: query } }] }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async detail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        histories: true,
        favorites: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  ban(id: string, reason?: string) {
    return this.prisma.user.update({ where: { id }, data: { status: 'banned' } });
  }
}


