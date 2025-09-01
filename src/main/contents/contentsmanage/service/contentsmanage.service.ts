import { Injectable } from '@nestjs/common';
import { CreateContentsmanageDto } from '../dto/create-contentsmanage.dto';
import { UpdateContentsmanageDto } from '../dto/update-contentsmanage.dto';

@Injectable()
export class ContentsmanageService {
  create(createContentsmanageDto: CreateContentsmanageDto) {
    return 'This action adds a new contentsmanage';
  }

  findAll() {
    return `This action returns all contentsmanage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contentsmanage`;
  }

  update(id: number, updateContentsmanageDto: UpdateContentsmanageDto) {
    return `This action updates a #${id} contentsmanage`;
  }

  remove(id: number) {
    return `This action removes a #${id} contentsmanage`;
  }
}
