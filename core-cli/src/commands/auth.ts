import chalk from 'chalk';
import inquirer from 'inquirer';
import { authStore, initAuthStore } from '../utils/authStore.js';
import { createStandardHelp, CommandHelpConfig } from '../utils/helpFormatter.js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode-terminal';
import boxen from 'boxen';

async function setupTotp(email: string) {
  // Generate TOTP secret
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'Package-Installer-CLI', secret);
  // Show QR code in terminal
  console.log(chalk.cyan('\nScan this QR code with Google Authenticator or a compatible app:'));
  qrcode.generate(otpauth, { small: true });
  console.log(chalk.gray(`If you can't scan, use this secret: ${chalk.yellow(secret)}`));
  return secret;
}

async function verifyTotpPrompt(secret: string) {
  for (let i = 0; i < 3; ++i) {
    const { code } = await inquirer.prompt([
      { name: 'code', message: 'Enter 6-digit code from your Authenticator app:', type: 'input', validate: (v: string) => /^\d{6}$/.test(v) || 'Enter a 6-digit code' }
    ]);
    if (authenticator.check(code, secret)) return true;
    console.log(chalk.red('❌ Invalid code. Try again.'));
  }
  return false;
}

// Add a function for 2FA setup and verification (used in both register and verify)
async function setupAndVerifyTotp(email: string) {
  const secret = await setupTotp(email);
  await authStore.setTotpSecret(email, secret);
  const verified = await verifyTotpPrompt(secret);
  if (!verified) {
    console.log(chalk.red('❌ Verification failed. 2FA not enabled.'));
    return false;
  }
  await authStore.setVerified(email, true);
  console.log(chalk.green('✅ 2FA enabled and verified!'));
  return true;
}

// Patch interactiveRegister to make 2FA optional
async function interactiveRegister() {
  const { email, password, confirm } = await inquirer.prompt([
    { name: 'email', message: 'Email:', type: 'input', validate: (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email' },
    { name: 'password', message: 'Password (min 8 chars):', type: 'password', validate: (v: string) => v.length >= 8 || 'Password must be at least 8 characters' },
    { name: 'confirm', message: 'Confirm Password:', type: 'password', mask: '*' },
  ]);
  if (password !== confirm) {
    console.log(chalk.red('Passwords do not match'));
    return;
  }
  let created = false;
  try {
    console.log(boxen(chalk.bold('Registering new user'), { padding: 1, borderColor: 'green' }));
    await authStore.createUser(email, password);
    created = true;
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      console.log(boxen(chalk.red('User already exists. Please login or use a different email.'), { padding: 1, borderColor: 'red' }));
      return;
    }
    console.log(boxen(chalk.red('Registration failed: ' + (err.message || String(err))), { padding: 1, borderColor: 'red' }));
    return;
  }
  // Suggest 2FA setup
  const { enable2fa } = await inquirer.prompt([
    { name: 'enable2fa', type: 'confirm', message: 'Would you like to enable 2FA (recommended)?', default: true }
  ]);
  if (enable2fa) {
    console.log(chalk.gray('Setting up 2FA...'));
    const verified = await setupAndVerifyTotp(email);
    if (!verified) {
      console.log(boxen(chalk.yellow('2FA setup incomplete. You can enable it later with: pi auth verify'), { padding: 1 }));
    }
  } else {
    console.log(boxen(chalk.yellow('⚠️  2FA is not enabled. You can enable it anytime with: pi auth verify'), { padding: 1 }));
  }
  // Always auto-login after registration if user was created
  if (created) {
    // Create session (auto-login)
    await authStore.createSession(email);
    console.log(boxen(chalk.green('✅ Registered and logged in — welcome!'), { padding: 1, borderColor: 'green' }));
    if (!enable2fa) console.log(chalk.yellow('Note: 2FA not enabled. Enable with: pi auth verify'));
  }
}

async function interactiveLogin() {
  const responses = await inquirer.prompt([
    { name: 'email', message: 'Email:', type: 'input', validate: (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email' },
    { name: 'password', message: 'Password:', type: 'password', validate: (v: string) => v.length >= 8 || 'Password must be at least 8 characters' },
  ]);
  const { email, password } = responses as { email: string; password: string };
  try {
    const ok = await authStore.login(email, password);
    if (!ok) {
      console.log(chalk.red('❌ Invalid email or password'));
      return;
    }
    // Check verification
    const secret = await authStore.getTotpSecret(email);
    const isVerified = await authStore.isVerified(email);
    if (!secret) {
      console.log(chalk.red('❌ This account does not have 2FA set up. Please register again.'));
      await authStore.logout();
      return;
    }
    if (!isVerified) {
      console.log(chalk.red('❌ This account is not verified. Please complete TOTP verification during registration.'));
      await authStore.logout();
      return;
    }
    // Prompt for TOTP code
    const { code } = await inquirer.prompt([
      { name: 'code', message: 'Enter 6-digit code from your Authenticator app:', type: 'input', validate: (v: string) => /^\d{6}$/.test(v) || 'Enter a 6-digit code' }
    ]);
    if (!authenticator.check(code, secret)) {
      console.log(chalk.red('❌ Invalid code. Login aborted.'));
      await authStore.logout();
      return;
    }
    console.log(chalk.green('✅ Logged in successfully'));
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      console.log(chalk.red('❌ User already exists. Please login or use a different email.'));
      return;
    }
    console.log(chalk.red('❌'), err.message || String(err));
  }
}

export async function handleAuthOptions(subcommand?: string, value?: string, opts: any = {}) {
  await initAuthStore();

  // Help flag or no subcommand: show help
  if (opts.help || opts['--help'] || opts['-h'] || subcommand === '--help' || subcommand === '-h' || !subcommand) {
    showAuthHelp();
    return;
  }

  try {
    // Normalize subcommand for robust matching
    const cmd = (subcommand || '').toLowerCase();
    switch (cmd) {
      case 'login': {
        if (opts.email && opts.password) {
          try {
            const ok = await authStore.login(opts.email, opts.password);
            if (!ok) {
              console.log(chalk.red('❌ Invalid email or password'));
              return;
            }
            // Check verification and handle totp provided for non-interactive flows
            const secret = await authStore.getTotpSecret(opts.email);
            const isVerified = await authStore.isVerified(opts.email);
            if (!secret) {
              console.log(chalk.red('❌ This account does not have 2FA set up. Please register again.'));
              return;
            }
            if (!isVerified) {
              console.log(chalk.red('❌ This account is not verified. Please complete TOTP verification with: pi auth verify'));
              return;
            }
            // TOTP: allow up to 3 interactive attempts. If --totp provided, use it (single check).
            let code = opts.totp;
            if (code) {
              if (!authenticator.check(code, secret)) {
                console.log(chalk.red('❌ Invalid TOTP code provided. Login failed.'));
                return;
              }
            } else {
              let ok = false;
              for (let i = 0; i < 3; ++i) {
                const resp = await inquirer.prompt([{ name: 'code', message: 'Enter 6-digit code from your Authenticator app:', type: 'input', validate: (v: string) => /^\d{6}$/.test(v) || 'Enter a 6-digit code' }]);
                if (authenticator.check(resp.code, secret)) { ok = true; break; }
                console.log(chalk.red('❌ Invalid code. Try again.'));
              }
              if (!ok) {
                console.log(chalk.red('❌ Too many invalid attempts. Login failed.'));
                return;
              }
            }
            // Create session now that password and 2FA are verified
            await authStore.createSession(opts.email);
            console.log(chalk.green('✅ Logged in successfully'));
          } catch (err: any) {
            if (err.message && err.message.includes('already exists')) {
              console.log(chalk.red('❌ User already exists. Please login or use a different email.'));
              return;
            }
            console.log(chalk.red('❌'), err.message || String(err));
          }
        } else {
          // Interactive login
          const responses = await inquirer.prompt([
            { name: 'email', message: 'Email:', type: 'input', validate: (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email' },
            { name: 'password', message: 'Password:', type: 'password', mask: '*', validate: (v: string) => v.length >= 8 || 'Password must be at least 8 characters' },
          ]);
          const { email, password } = responses as { email: string; password: string };
          const ok = await authStore.login(email, password);
          if (!ok) {
            console.log(chalk.red('❌ Invalid email or password'));
            return;
          }
          const secret = await authStore.getTotpSecret(email);
          const isVerified = await authStore.isVerified(email);
          if (!secret) {
            console.log(chalk.red('❌ This account does not have 2FA set up. Please register again.'));
            return;
          }
          if (!isVerified) {
            console.log(chalk.red('❌ This account is not verified. Please complete TOTP verification with: pi auth verify'));
            return;
          }
          // Interactive login: allow up to 3 attempts
          let okTotp = false;
          for (let i = 0; i < 3; ++i) {
            const { code } = await inquirer.prompt([{ name: 'code', message: 'Enter 6-digit code from your Authenticator app:', type: 'input', validate: (v: string) => /^\d{6}$/.test(v) || 'Enter a 6-digit code' }]);
            if (authenticator.check(code, secret)) { okTotp = true; break; }
            console.log(chalk.red('❌ Invalid code. Try again.'));
          }
          if (!okTotp) {
            console.log(chalk.red('❌ Too many invalid attempts. Login failed.'));
            return;
          }
          await authStore.createSession(email);
          console.log(chalk.green('✅ Logged in successfully'));
        }
        return;
      }
      case 'register': {
        if (opts.email && opts.password) {
          try {
            console.log(boxen(chalk.bold('Registering new user'), { padding: 1, borderColor: 'green' }));
            await authStore.createUser(opts.email, opts.password);
            // Suggest 2FA setup flow same as interactive
            if (opts.enable2fa || opts.enable2fa === undefined) {
              const secret = await setupTotp(opts.email);
              await authStore.setTotpSecret(opts.email, secret);
              const verified = await verifyTotpPrompt(secret);
              if (!verified) {
                console.log(boxen(chalk.yellow('2FA verification failed. Registration saved but 2FA incomplete.'), { padding: 1 }));
                await authStore.createSession(opts.email);
                return;
              }
              await authStore.setVerified(opts.email, true);
            }
            // Create session
            await authStore.createSession(opts.email);
            console.log(boxen(chalk.green('✅ User registered and logged in.'), { padding: 1, borderColor: 'green' }));
          } catch (err: any) {
            console.log(boxen(chalk.red('Registration failed: ' + (err.message || String(err))), { padding: 1, borderColor: 'red' }));
          }
        } else {
          await interactiveRegister();
        }
        return;
      }
      case 'verify': {
        // Get current session or prompt for email
        let email = opts.email;
        if (!email) {
          const session = await authStore.getSession();
          if (session && session.email) {
            email = session.email;
          } else {
            const resp = await inquirer.prompt([
              { name: 'email', message: 'Email to verify:', type: 'input', validate: (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Enter a valid email' }
            ]);
            email = resp.email;
          }
        }
        // Check if user exists
        const users = await authStore.getUsers();
        const user = users.find(u => u.email === email.toLowerCase());
        if (!user) {
          console.log(chalk.red('❌ User not found. Please register first.'));
          return;
        }
        // If already verified, skip
        if (user.verified) {
          console.log(chalk.green('✅ 2FA is already enabled for this user.'));
          return;
        }
        await setupAndVerifyTotp(email);
        return;
      }
      case 'logout': {
        await authStore.logout();
        console.log(chalk.green('✅ Logged out'));
        return;
      }
      case 'status': {
        const s = await authStore.getSession();
        if (s) console.log(chalk.green(`Logged in as ${s.email}`));
        else console.log(chalk.yellow('Not logged in'));
        return;
      }
      case 'whoami': {
        const s = await authStore.getSession();
        if (s) console.log(chalk.green(`${s.email}`));
        else console.log(chalk.yellow('Not logged in'));
        return;
      }
      case 'list-users': {
        const users = await authStore.getUsers();
        if (!users || users.length === 0) {
          console.log(chalk.yellow('No users registered'));
          return;
        }
        console.log(chalk.green('Registered users:'));
        users.forEach(u => console.log(' - ' + u.email));
        return;
      }
      default: {
        showAuthHelp();
        return;
      }
    }
  } catch (err: any) {
    console.log(chalk.red('❌'), err.message || String(err));
  }
}

export function showAuthHelp() {
  const cfg: CommandHelpConfig = {
    commandName: 'auth',
    emoji: '🔐',
    description: 'Manage authentication for the CLI (register, login, logout, status, 2FA verification).',
    usage: [
      'auth register',
      'auth login',
      'auth login --email <email> --password <password>',
      'auth logout',
      'auth status',
      'auth verify',
      'auth whoami',
      'auth list-users',
    ],
    options: [
      { flag: '--email <email>', description: 'Email for non-interactive actions' },
      { flag: '--password <password>', description: 'Password for non-interactive actions' },
      { flag: '-h, --help', description: 'Show help for the auth command' },
    ],
    examples: [
      { command: 'auth register', description: 'Interactive registration' },
      { command: 'auth login', description: 'Interactive login' },
      { command: 'auth login --email me@you.com --password hunter2', description: 'Non-interactive login (use with care)' },
      { command: 'auth verify', description: 'Enable and verify 2FA for your account' },
      { command: 'auth logout', description: 'Logout from the CLI' },
      { command: 'auth status', description: 'Show current login status' },
      { command: 'auth whoami', description: 'Show current user email' },
      { command: 'auth list-users', description: 'List all registered users' },
    ],
    tips: [
      '🔒 2FA (Google Authenticator) is required for unlimited CLI access.',
      'Unverified users can only use 3 commands before verification is required.',
      'Passwords are stored as scrypt hashes with per-user salt. Keep your machine secure.',
      'Use "pi auth verify" to enable 2FA and unlock all features.',
    ],
  };
  createStandardHelp(cfg);
}
