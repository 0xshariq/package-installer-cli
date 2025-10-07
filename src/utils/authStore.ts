import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface AuthRecord {
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
  totpSecret?: string; // base32
  verified?: boolean;
  usageCount?: number; // Number of allowed commands used while unverified
  usageLimit?: number; // Max allowed commands while unverified (default 3)
}

export class AuthStore {
  private dir: string;
  private file: string;
  private sessionFile: string;
  private records: AuthRecord[] = [];
  private failedAttempts: Record<string, { count: number; lastAttempt: number }> = {};

  constructor() {
    this.dir = path.join(os.homedir(), '.package-installer-cli');
    this.file = path.join(this.dir, 'auth.json');
    this.sessionFile = path.join(this.dir, 'session.json');
  }

  async init(): Promise<void> {
    await fs.ensureDir(this.dir);
    // Restrict directory permissions to user only
    try {
      await fs.chmod(this.dir, 0o700);
    } catch {}

    if (await fs.pathExists(this.file)) {
      try {
        const data = await fs.readJson(this.file);
        this.records = Array.isArray(data) ? data : [];
      } catch {
        this.records = [];
      }
    }
  }

  private async save(): Promise<void> {
    await fs.writeJson(this.file, this.records, { spaces: 2 });
    // Restrict file permissions to user only
    try {
      await fs.chmod(this.file, 0o600);
    } catch {}
  }

  private hashPassword(password: string, salt: Buffer): Buffer {
    // Use scrypt for password hashing (built-in, fast and secure)
    return crypto.scryptSync(password, salt, 64);
  }

  async createUser(email: string, password: string): Promise<AuthRecord> {
    const existing = this.records.find(r => r.email === email.toLowerCase());
    if (existing) throw new Error('User already exists');
    // Basic validation
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      throw new Error('Invalid email address');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    const salt = crypto.randomBytes(16);
    const hash = this.hashPassword(password, salt);
    const record: AuthRecord = {
      email: email.toLowerCase(),
      salt: salt.toString('hex'),
      hash: hash.toString('hex'),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      usageLimit: 3,
    };
    this.records.push(record);
    await this.save();
    return record;
  }
  // Increment usage for unverified user, return true if allowed, false if over limit
  async incrementUsage(email: string): Promise<boolean> {
    const rec = this.records.find(r => r.email === email.toLowerCase());
    if (!rec) throw new Error('User not found');
    if (rec.verified) return true; // No limit for verified
    if (typeof rec.usageCount !== 'number') rec.usageCount = 0;
    if (typeof rec.usageLimit !== 'number') rec.usageLimit = 3;
    if (rec.usageCount >= rec.usageLimit) return false;
    rec.usageCount += 1;
    await this.save();
    return true;
  }

  // Reset usage when user is verified

  async verifyUser(email: string, password: string): Promise<boolean> {
    const record = this.records.find(r => r.email === email.toLowerCase());
    if (!record) return false;
    // Simple rate limiting/backoff
    const key = email.toLowerCase();
    const now = Date.now();
    const entry = this.failedAttempts[key];
    if (entry && entry.count >= 5 && now - entry.lastAttempt < 60_000) {
      // Lockout for 60s after 5 failed attempts
      throw new Error('Too many failed attempts. Try again later.');
    }
    const salt = Buffer.from(record.salt, 'hex');
    const hash = this.hashPassword(password, salt);
    const stored = Buffer.from(record.hash, 'hex');
    // Use timingSafeEqual to avoid timing attacks
    if (stored.length !== hash.length) return false;
    const ok = crypto.timingSafeEqual(stored, hash);
    if (!ok) {
      // record failed attempt
      if (!this.failedAttempts[key]) this.failedAttempts[key] = { count: 0, lastAttempt: now };
      this.failedAttempts[key].count += 1;
      this.failedAttempts[key].lastAttempt = now;
    } else {
      // reset on success
      delete this.failedAttempts[key];
    }
    return ok;
  }

  async login(email: string, password: string): Promise<boolean> {
    const ok = await this.verifyUser(email, password);
    if (!ok) return false;
    await fs.writeJson(this.sessionFile, { email: email.toLowerCase(), loggedAt: new Date().toISOString() }, { spaces: 2 });
    return true;
  }

  async logout(): Promise<void> {
    if (await fs.pathExists(this.sessionFile)) {
      await fs.remove(this.sessionFile);
    }
  }

  async getSession(): Promise<{ email: string } | null> {
    if (!(await fs.pathExists(this.sessionFile))) return null;
    try {
      const data = await fs.readJson(this.sessionFile);
      return { email: (data.email || '').toLowerCase() };
    } catch {
      return null;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const s = await this.getSession();
    return !!s?.email;
  }

  async getUsers(): Promise<AuthRecord[]> {
    return this.records.slice();
  }

  async setTotpSecret(email: string, secret: string): Promise<void> {
    const rec = this.records.find(r => r.email === email.toLowerCase());
    if (!rec) throw new Error('User not found');
    rec.totpSecret = secret;
    await this.save();
  }

  async setVerified(email: string, verified: boolean): Promise<void> {
    const rec = this.records.find(r => r.email === email.toLowerCase());
    if (!rec) throw new Error('User not found');
    rec.verified = verified;
    if (verified) {
      rec.usageCount = undefined;
      rec.usageLimit = undefined;
    }
    await this.save();
  }

  async getTotpSecret(email: string): Promise<string | undefined> {
    const rec = this.records.find(r => r.email === email.toLowerCase());
    return rec?.totpSecret;
  }

  async isVerified(email: string): Promise<boolean> {
    const rec = this.records.find(r => r.email === email.toLowerCase());
    return !!rec?.verified;
  }
}

export const authStore = new AuthStore();

export async function initAuthStore(): Promise<void> {
  await authStore.init();
}
