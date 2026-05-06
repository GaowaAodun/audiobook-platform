import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AudiobooksService } from './audiobooks.service';
import {
  AudiobookQueryDto,
  CreateAudiobookDto,
  CreateChapterDto,
  UpdateAudiobookDto,
  UpdateChapterDto,
} from './dto/audiobook.dto';

interface JwtRequest {
  user: { userId: string; role: UserRole };
}

@ApiTags('audiobooks')
@Controller('audiobooks')
export class AudiobooksController {
  constructor(private readonly audiobooksService: AudiobooksService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List audiobooks with filters and pagination' })
  findAll(@Query() query: AudiobookQueryDto) {
    return this.audiobooksService.findAll(query);
  }

  // ── Admin write operations ───────────────────────────────────────────────
  // Specific paths must come before :id to avoid swallowing them as params

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new audiobook' })
  create(@Body() dto: CreateAudiobookDto, @Request() req: JwtRequest) {
    return this.audiobooksService.create(dto, req.user.userId);
  }

  @Patch('chapters/:chapterId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a chapter' })
  updateChapter(
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.audiobooksService.updateChapter(chapterId, dto);
  }

  @Delete('chapters/:chapterId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a chapter' })
  removeChapter(@Param('chapterId') chapterId: string) {
    return this.audiobooksService.removeChapter(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audiobook details with chapters' })
  findOne(@Param('id') id: string) {
    return this.audiobooksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an audiobook' })
  update(@Param('id') id: string, @Body() dto: UpdateAudiobookDto) {
    return this.audiobooksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an audiobook' })
  remove(@Param('id') id: string) {
    return this.audiobooksService.remove(id);
  }

  @Post(':id/chapters')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a chapter to an audiobook' })
  addChapter(@Param('id') id: string, @Body() dto: CreateChapterDto) {
    return this.audiobooksService.addChapter(id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish an audiobook' })
  publish(@Param('id') id: string) {
    return this.audiobooksService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CONTENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish an audiobook' })
  unpublish(@Param('id') id: string) {
    return this.audiobooksService.unpublish(id);
  }
}
