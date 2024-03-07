import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { DataParserService } from 'src/bot/data.service';
import { FirebaseService } from 'database/firebase.service';

@Module({
  imports: [],
  controllers: [],
  providers: [BotService, DataParserService, FirebaseService],
})
export class BotModule {}
