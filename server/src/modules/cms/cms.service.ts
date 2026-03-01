import { prisma } from '../../lib/prisma';
import { ContentType, ContentStatus } from '@prisma/client';

export async function listContent(
    type?: ContentType,
    status: ContentStatus = 'published',
    page = 1,
    limit = 20
) {
    const where = {
        ...(type ? { type } : {}),
        status,
    };
    const [items, total] = await Promise.all([
        prisma.content.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.content.count({ where }),
    ]);
    return { items, total, page, limit };
}

export async function getContentBySlug(slug: string) {
    return prisma.content.findUnique({ where: { slug } });
}

export async function createContent(data: {
    type: ContentType;
    title: string;
    slug: string;
    body?: any;
    featured?: boolean;
    status?: ContentStatus;
}) {
    return prisma.content.create({ data });
}

export async function updateContent(
    id: string,
    data: Partial<{
        title: string;
        body: any;
        status: ContentStatus;
        featured: boolean;
    }>
) {
    return prisma.content.update({ where: { id }, data });
}

export async function deleteContent(id: string) {
    return prisma.content.delete({ where: { id } });
}
