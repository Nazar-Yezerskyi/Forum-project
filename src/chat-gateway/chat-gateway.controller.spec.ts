import { Test, TestingModule } from '@nestjs/testing';
import { ChatGatewayController } from './chat-gateway.controller';

describe('ChatGatewayController', () => {
  let controller: ChatGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatGatewayController],
    }).compile();

    controller = module.get<ChatGatewayController>(ChatGatewayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
