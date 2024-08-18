import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../common/schema/user.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    FirebaseModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
