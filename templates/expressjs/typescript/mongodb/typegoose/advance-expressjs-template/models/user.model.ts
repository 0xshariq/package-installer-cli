import { prop, getModelForClass, index, pre } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

@index({ email: 1 })
@pre<User>('save', function() {
  console.log(`About to save user: ${this.email}`);
})
export class User extends TimeStamps {
  @prop({ 
    required: true, 
    trim: true, 
    minlength: 2, 
    maxlength: 50 
  })
  public name!: string;

  @prop({ 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  })
  public email!: string;

  @prop({ default: true })
  public isActive!: boolean;

  // Instance method
  public getDisplayName(this: User): string {
    return `${this.name} (${this.email})`;
  }

  // Static method
  public static findByEmail(this: ReturnType<typeof getUserModel>, email: string) {
    return this.findOne({ email }).exec();
  }

  // Get public profile
  public getPublicProfile(this: User) {
    return {
      id: this._id,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Create and export the model
export const getUserModel = () => getModelForClass(User);
export const UserModel = getUserModel(); 