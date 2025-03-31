import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

export interface INotification extends Document {
  readonly _id: mongoose.Types.ObjectId;
  readonly senderId: number;
  readonly title: string;
  readonly content: Buffer;
  readonly createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    senderId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'notifications',
    strict: true,
    timestamps: { createdAt: 'createdAt' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return {
          id: ret.id,
          ...ret,
        };
      },
    },
  },
);

export default NotificationSchema;
