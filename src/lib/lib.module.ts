import { Module } from '@nestjs/common';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
// import { SeedModule } from './seed/seed.module';

import { MulterModule } from './multer/multer.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [PrismaModule, MailModule, UtilsModule, FileModule, MulterModule],
  exports: [],
  providers: [],
})
export class LibModule {}
