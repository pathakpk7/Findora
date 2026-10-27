import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'apps', 'backend', 'uploads');
          if (!existsSync(uploadPath))
            mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const name = `${Date.now()}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
    })
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) return { message: 'Unauthorized' };

    const avatarUrl = `/uploads/${file.filename}`;
    return this.usersService.update(userId, { avatar: avatarUrl } as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
