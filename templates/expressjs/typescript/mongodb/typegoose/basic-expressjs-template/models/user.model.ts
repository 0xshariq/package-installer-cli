import { prop, getModelForClass } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class User extends TimeStamps {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, unique: true, lowercase: true, trim: true })
  public email!: string;

  // Instance method
  public getDisplayName(this: User): string {
    return `${this.name} (${this.email})`;
  }
}

// Create and export the model
export const getUserModel = () => getModelForClass(User);
export const UserModel = getUserModel(); 