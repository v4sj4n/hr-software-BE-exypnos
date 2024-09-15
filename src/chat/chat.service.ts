import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(content: string, senderId: number) {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
      },
    });
  }

  async getMessages() {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        sender: true, // Include the sender details
      },
    });
  }
}
