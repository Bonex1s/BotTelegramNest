import { Injectable } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { helpcmd, list } from 'src/bot/data/datacmd';
import { DataParserService } from 'src/bot/data.service';
import * as dotenv from 'dotenv';
import { FirebaseService } from 'database/firebase.service';

dotenv.config();

@Injectable()
export class BotService {
  private readonly bot: Telegraf;

  constructor(
    private readonly dataService: DataParserService,
    private readonly firebaseService: FirebaseService,
  ) {
    const token = process.env.TOKEN;
    this.bot = new Telegraf(token);
    this.setupBot();
    this.startPolling();
  }

  private setupBot() {
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.bot.help((ctx) => {
      const helpersValue = Object.values(helpcmd);
      ctx.reply('Список команд' + ' ' + helpersValue);
    });
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.on('sticker', (ctx) => ctx.reply('ахахаххахахахахахха'));
    this.bot.command('model', async (ctx) => {
      const models = await this.dataService.getModels();
      const buttons = models.sort();
      const keyboard = Markup.keyboard(buttons, { columns: 3 })
        .resize()
        .oneTime();
      ctx.reply('Виберіть модель:', keyboard);
    });
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.hears('14 pro max', async (ctx) => {
      const text = ctx.message.text?.toLowerCase();
      const { price, nameModel, priceDollar } = await this.dataService.elements(
        'https://storeinua.com/ua/apple-all-uk/iphone/iphone-14-pro-max/apple-iphone-14-pro-max-256gb-deep-purple-mq9x3-ua.html',
      );
      ctx.reply(
        `Назва: ${nameModel}\nЦіна:${price} ${priceDollar}\nСайт: StoreInUa`,
      );
    });
    this.bot.hears('Дякую', (ctx) => ctx.reply('Немає за що))'));
    this.bot.command('stats', async (ctx) => {
      const stats = await this.firebaseService.getAllDocs();
      let statsString = '';

      stats.forEach((doc) => {
        const docData = doc.data();
        const docId = doc.id;
        statsString += `Місяць: ${docId}, : ${JSON.stringify(docData)}\n`;
      });

      ctx.reply(statsString);
    });

    this.bot.hears(['аванс', 'Аванс'], async (ctx) => {
      if ('text' in ctx.message) {
        const username = ctx.message.from.username;
        const userId = ctx.message.from.id;
        await this.firebaseService.addUser(username, userId);
        ctx.reply('Пользователь успешно добавлен в базу данных Firebase!))');
      }
    });
    this.bot.hears('Список', (ctx) => {
      const objValues = Object.values(list);
      ctx.reply('Працівники:' + ' ' + objValues);
    });

    this.bot.on('message', async (ctx) => {
      if (ctx.message && 'text' in ctx.message) {
        const parts = ctx.message.text.split(' ');
        if (parts.length >= 1) {
          const [firstWord, ...rest] = parts;
          if (
            [
              'Січень',
              'Лютий',
              'Березень',
              'Квітень',
              'Травень',
              'Червень',
              'Липень',
              'Серпень',
              'Вересень',
              'Жовтень',
              'Листопад',
              'Грудень',
            ].includes(firstWord)
          ) {
            const [month, employeeName, advanceToAdd] = [firstWord, ...rest];
            try {
              const response =
                await this.firebaseService.updateAdvanceForEmployee(
                  month,
                  employeeName,
                  parseInt(advanceToAdd),
                );

              ctx.reply(response);
            } catch (error) {
              console.error('Произошла ошибка при обновлении данных: ', error);
              ctx.reply(
                'Произошла ошибка при обновлении данных. Пожалуйста, попробуйте еще раз.',
              );
            }
          } else {
            const model = ctx.message.text.trim();
            const accessories =
              await this.dataService.getModelAccessories(model);
            if (accessories) {
              ctx.reply(
                `Чохол: ${accessories.case}\n\nСкло: ${accessories.screenProtector}`,
              );
            }
          }
        }
      } else {
        console.log('Біда');
      }
    });
  }

  private startPolling() {
    this.bot.launch().then(() => console.log('Telegram bot started'));
  }
}
