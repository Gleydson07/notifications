import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotification } from './schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { toHttpError } from '../../../utils/ErrorHandling';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<INotification>,
  ) {}

  async create(notification: CreateNotificationDto): Promise<INotification> {
    try {
      const notificationCreated = new this.notificationModel(notification);
      return (await notificationCreated.save()).toJSON();
    } catch (error) {
      toHttpError(error);
    }
  }

  async findAll(): Promise<INotification[]> {
    try {
      return await this.notificationModel.find().exec();
    } catch (error) {
      toHttpError(error);
    }
  }

  async count() {
    try {
      return this.notificationModel.countDocuments();
    } catch (error) {
      toHttpError(error);
    }
  }

  async delete(id: string) {
    try {
      const updatedCompany = await this.notificationModel.findByIdAndDelete(id);

      if (!updatedCompany) {
        throw new NotFoundException('Notification not found');
      }
    } catch (error) {
      toHttpError(error);
    }
  }
}
