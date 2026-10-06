import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import type { AuthenticatedRequest } from '../users/middleware/jwt-auth.middleware';
import { BannersService } from './banners.service';
import {
  CreateBannerDto,
  DeleteBannerDto,
  ReorderBannersDto,
  UpdateBannerDto,
} from './dto/banner.dto';

const BANNER_UPLOAD_DIR = join(process.cwd(), 'assets', 'images', 'dholera_banner');

// Ensure destination directory exists
if (!existsSync(BANNER_UPLOAD_DIR)) {
  mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });
}

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(BANNER_UPLOAD_DIR)) {
            mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });
          }
          cb(null, BANNER_UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `banner_${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.bmp'];
        if (file.mimetype?.startsWith('image/') || allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, webp, gif, svg) are allowed!',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadBannerImage(
    @UploadedFile() file?: Express.Multer.File,
    @Req() request?: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided for upload.');
    }

    const relativePath = `/assets/images/dholera_banner/${file.filename}`;
    const host =
      request?.headers?.host ||
      (request?.get ? request.get('host') : 'localhost:5000') ||
      'localhost:5000';
    const protocol = request?.protocol || 'http';
    const fullUrl = `${protocol}://${host}${relativePath}`;

    return this.response('Banner image uploaded successfully.', {
      filename: file.filename,
      relativePath,
      pathOfBanner: relativePath,
      fullUrl,
      size: file.size,
      mimetype: file.mimetype,
    });
  }

  @Post('create')
  async create(
    @Body() dto: CreateBannerDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const addedBy = request.user?.user_id || dto.addedBy || '1';
    const data = await this.bannersService.create(dto, addedBy);
    return this.response('Banner created successfully.', data);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!dto.modifiedBy && request.user?.user_id) {
      dto.modifiedBy = request.user.user_id;
    }
    const data = await this.bannersService.update(id, dto);
    return this.response('Banner updated successfully.', data);
  }

  @Post('delete/:id')
  async remove(
    @Param('id') id: string,
    @Body() dto: DeleteBannerDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!dto.modifiedBy && request.user?.user_id) {
      dto.modifiedBy = request.user.user_id;
    }
    const data = await this.bannersService.remove(id, dto);
    return this.response('Banner deleted successfully.', data);
  }

  @Post('reorder')
  async reorder(
    @Body() dto: ReorderBannersDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!dto.modifiedBy && request.user?.user_id) {
      dto.modifiedBy = request.user.user_id;
    }
    await this.bannersService.reorder(dto);
    return this.response('Banners reordered successfully.', null);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.bannersService.findAll(status, search);
    return this.response('Banners retrieved successfully.', data);
  }

  @Get('active')
  async findActive() {
    const data = await this.bannersService.findActive();
    return this.response('Active banners retrieved successfully.', data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(id);
    return this.response('Banner retrieved successfully.', data);
  }

  private response(message: string, data: unknown) {
    return { status: true, message, data };
  }
}
