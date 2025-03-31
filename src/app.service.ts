import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { NotificationsService } from './app/modules/notifications/notifications.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private notificationService: NotificationsService) {}

  async onApplicationBootstrap() {
    const count = await this.notificationService.count();

    if (count === 0) {
      const createdNotificationDto = await this.notificationService.create({
        senderId: 1,
        title: 'Initial Notification',
        message: Buffer.from(
          JSON.stringify('This is an initial notification for setup.'),
        ),
      });

      await this.notificationService.delete(createdNotificationDto.id);
    }

    console.log('Database inicializado com sucesso! 🚀');
  }
}
