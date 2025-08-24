import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditLogData {
  adminUserId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  diffJson?: any;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminUserId: data.adminUserId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          diffJson: data.diffJson ? JSON.stringify(data.diffJson) : undefined,
          ip: data.ip,
          userAgent: data.userAgent,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      // Log error but don't throw to avoid breaking main operations
      console.error('Failed to log audit event:', error);
    }
  }

  async getAuditLogs(filters: {
    adminUserId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters.adminUserId) where.adminUserId = filters.adminUserId;
    if (filters.action) where.action = filters.action;
    if (filters.targetType) where.targetType = filters.targetType;
    if (filters.targetId) where.targetId = filters.targetId;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [actionStats, userStats, dailyStats] = await Promise.all([
      // Actions breakdown
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
      }),

      // Most active users
      this.prisma.auditLog.groupBy({
        by: ['adminUserId'],
        where: { ...where, adminUserId: { not: null } },
        _count: true,
        orderBy: { _count: { adminUserId: 'desc' } },
        take: 10,
      }),

      // Daily activity
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM audit_logs
        WHERE created_at >= ${startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND created_at <= ${endDate || new Date()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    return {
      actionStats,
      userStats,
      dailyStats,
    };
  }
}
