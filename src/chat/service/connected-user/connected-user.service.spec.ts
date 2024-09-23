import { beforeEach, describe, it } from "node:test";
import { ConnectedUserService } from "./connected-user.service";
import { Test, TestingModule } from "@nestjs/testing";


describe('ConnectedUserService', () => {
  let service: ConnectedUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectedUserService],
    }).compile();

    service = module.get<ConnectedUserService>(ConnectedUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});