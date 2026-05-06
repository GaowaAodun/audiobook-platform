import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  AudiobookQueryDto,
  CreateAudiobookDto,
  CreateChapterDto,
  UpdateAudiobookDto,
  UpdateChapterDto,
} from './dto/audiobook.dto';

const AUDIOBOOK_DETAIL_INCLUDE = {
  category: true,
  tags: { include: { tag: true } },
  chapters: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.AudiobookInclude;

const AUDIOBOOK_LIST_INCLUDE = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.AudiobookInclude;

@Injectable()
export class AudiobooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAudiobookDto, uploadedBy: string) {
    const { tagIds, ...rest } = dto;

    return this.prisma.audiobook.create({
      data: {
        ...rest,
        uploadedBy,
        ...(tagIds?.length && {
          tags: { create: tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: AUDIOBOOK_LIST_INCLUDE,
    });
  }

  async findAll(query: AudiobookQueryDto) {
    const { page, limit, categoryId, language, accessType, ageRating, contentType, search } =
      query;

    const where: Prisma.AudiobookWhereInput = {};

    if (categoryId) where.categoryId = categoryId;
    if (language) where.language = language;
    if (accessType) where.accessType = accessType;
    if (ageRating) where.ageRating = ageRating;
    if (contentType) where.contentType = contentType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.audiobook.findMany({
        where,
        include: AUDIOBOOK_LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.audiobook.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const audiobook = await this.prisma.audiobook.findUnique({
      where: { id },
      include: AUDIOBOOK_DETAIL_INCLUDE,
    });
    if (!audiobook) throw new NotFoundException('Audiobook not found');
    return audiobook;
  }

  async update(id: string, dto: UpdateAudiobookDto) {
    await this.findOne(id);
    const { tagIds, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (tagIds !== undefined) {
        await tx.audiobookTag.deleteMany({ where: { audiobookId: id } });
        if (tagIds.length > 0) {
          await tx.audiobookTag.createMany({
            data: tagIds.map((tagId) => ({ audiobookId: id, tagId })),
          });
        }
      }

      return tx.audiobook.update({
        where: { id },
        data: rest,
        include: AUDIOBOOK_LIST_INCLUDE,
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.audiobook.delete({ where: { id } });
  }

  async addChapter(audiobookId: string, dto: CreateChapterDto) {
    await this.findOne(audiobookId);
    return this.prisma.chapter.create({ data: { ...dto, audiobookId } });
  }

  async updateChapter(chapterId: string, dto: UpdateChapterDto) {
    return this.prisma.chapter.update({ where: { id: chapterId }, data: dto });
  }

  async removeChapter(chapterId: string) {
    return this.prisma.chapter.delete({ where: { id: chapterId } });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.audiobook.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.prisma.audiobook.update({
      where: { id },
      data: { isPublished: false },
    });
  }
}
