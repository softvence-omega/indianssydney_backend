import { Injectable } from '@nestjs/common';
import { CreateContentmanageDto } from '../dto/create-contentmanage.dto';
import { UpdateContentmanageDto } from '../dto/update-contentmanage.dto';

@Injectable()
export class ContentmanageService {
  create(createContentmanageDto: CreateContentmanageDto) {
    return 'This action adds a new contentmanage';
  }

  findAll() {
    return `This action returns all contentmanage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contentmanage`;
  }

  update(id: number, updateContentmanageDto: UpdateContentmanageDto) {
    return `This action updates a #${id} contentmanage`;
  }

  remove(id: number) {
    return `This action removes a #${id} contentmanage`;
  }
}
