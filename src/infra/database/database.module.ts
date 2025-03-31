import { Module } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports:[
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URL"),
        dbName: configService.get<string>("MONGO_DATABASE"),
        auth: {
          username: configService.get<string>("MONGO_USER"),
          password: configService.get<string>("MONGO_PASSWORD")
        },
        autoIndex: true,
      })
    }),
  ]
})
export class DatabaseModule {}
