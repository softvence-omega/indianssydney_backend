import { Test, TestingModule } from '@nestjs/testing';
import { LiveEventController } from './live-event.controller';
import { LiveEventService } from './live-event.service';

describe('LiveEventController', () => {
  let controller: LiveEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveEventController],
      providers: [LiveEventService],
    }).compile();

    controller = module.get<LiveEventController>(LiveEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
