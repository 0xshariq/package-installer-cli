import { prisma } from '../db/database.js';

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
  static async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        isActive: data.isActive ?? true,
      },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async updateUser(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        email: data.email ? data.email.toLowerCase() : undefined,
      },
    });
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  static async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
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