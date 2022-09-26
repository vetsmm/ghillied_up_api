import { Expose } from 'class-transformer';
import { UserOutput } from '../public/user-output.dto';

export class UserPushNotificationSettingsDto {
  @Expose()
  createdDate: Date;

  @Expose()
  updatedDate: Date;

  @Expose()
  user: UserOutput;

  @Expose()
  postReactions: boolean;

  @Expose()
  postComments: boolean;

  @Expose()
  commentReactions: boolean;

  @Expose()
  postActivity: boolean;
}
