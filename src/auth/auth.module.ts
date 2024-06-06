import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';


import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User, UserSchema } from './entities/user.entity';



@Module({
  imports: 
       
        [ 
          ConfigModule.forRoot(),
          MongooseModule.forFeature([ { name: User.name, schema: UserSchema },]),
          JwtModule.register({
            global: true,
            secret: process.env.JWT_SEED,
            signOptions: { expiresIn: '60s' },
          })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
