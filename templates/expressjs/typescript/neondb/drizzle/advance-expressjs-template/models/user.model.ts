import { eq, desc } from 'drizzle-orm';
import { db } from '../db/database.js';
import { users, type User, type NewUser, insertUserSchema } from '../db/schema.js';

export interface CreateUserData {
  name: string;
  email: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export class UserService {
  static async createUser(data: CreateUserData): Promise<User> {
    const validatedData = insertUserSchema.parse({
      name: data.name,
      email: data.email.toLowerCase(),
      isActive: data.isActive ?? true,
    });

    const [user] = await db.insert(users).values(validatedData).returning();
    return user;
  }

  static async findUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  static async updateUser(id: string, data: UpdateUserData): Promise<User | undefined> {
    const updateData: Partial<NewUser> = {
      ...data,
      email: data.email ? data.email.toLowerCase() : undefined,
      updatedAt: new Date(),
    };

    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  static async deleteUser(id: string): Promise<User | undefined> {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user;
  }

  static async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt
  };
});

// Pre-save middleware for data validation
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User; 