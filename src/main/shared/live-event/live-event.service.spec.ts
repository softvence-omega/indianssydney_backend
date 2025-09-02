import { Test, TestingModule } from '@nestjs/testing';
import { LiveEventService } from './live-event.service';

describe('LiveEventService', () => {
  let service: LiveEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveEventService],
    }).compile();

    service = module.get<LiveEventService>(LiveEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
