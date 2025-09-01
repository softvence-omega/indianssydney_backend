import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RecommendationService } from '../service/recommendation.service';
import { CreateRecommendationDto } from '../dto/create-recommendation.dto';
import {
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  GetUser,
  ValidateAdmin,
  ValidateAuth,
} from 'src/common/jwt/jwt.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType, MulterService } from 'src/lib/multer/multer.service';
import { UseSelectRecommendationDto } from '../dto/select-recommendation';

@ApiTags('Recommendation onboarding user selected')
@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  // -------- Create recommendation ----------
  @ApiOperation({ summary: 'Create a new recommendation for admin' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions(
        './temp',
        'recommendations',
        FileType.IMAGE,
      ),
    ),
  )
  async create(
    @GetUser('userId') userId: string,
    @Body() createRecommendationDto: CreateRecommendationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) createRecommendationDto.file = file;
    return this.recommendationService.create(createRecommendationDto, userId);
  }

  // -------- Assign user selected recommendation to a user ----------
  @ApiOperation({ summary: 'Assign an existing recommendation to a user' })
  @ValidateAuth()
  @ApiBearerAuth()
  @Post('userselect')
  async userSelectRecommendation(
    @GetUser('userId') userId: string,
    @Body() body: UseSelectRecommendationDto,
  ) {
    console.log(userId);
    return this.recommendationService.userSelect(userId, body);
  }

  // -------- Get all ----------
  @ApiOperation({ summary: 'Get all recommendations' })
  @Get()
  findAll() {
    return this.recommendationService.findAll();
  }

  // -------- Get one ----------
  @ApiOperation({ summary: 'Get recommendation by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recommendationService.findOne(id);
  }
  // ---------------- deleted use admin
  @ApiOperation({ summary: 'Delete recommendation by ID' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recommendationService.remove(id);
  }
  // ---------------- update use admin
  // ---------------- update use admin ----------------
  @ApiOperation({ summary: 'Update recommendation by ID' })
  @ApiBearerAuth()
  @ValidateAdmin()
  @Post('update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new MulterService().createMulterOptions(
        './temp',
        'recommendations',
        FileType.IMAGE,
      ),
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecommendationDto: CreateRecommendationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) updateRecommendationDto.file = file; // optional file handling
    return this.recommendationService.update(id, updateRecommendationDto);
  }
}
