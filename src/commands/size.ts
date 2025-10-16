import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { displayCommandBanner } from '../utils/banner.js';

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB','MB','GB','TB'];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function folderSize(p: string): Promise<number> {
  let total = 0;
  try {
    const stats = await fs.stat(p);
    if (stats.isFile()) return stats.size;
    if (stats.isDirectory()) {
      const items = await fs.readdir(p);
      for (const item of items) {
        const itemPath = path.join(p, item);
        total += await folderSize(itemPath);
      }
    }
  } catch (err) {
    // ignore permission errors
  }
  return total;
}

async function listLargestFiles(p: string, limit = 10): Promise<Array<{file: string, size: number}>> {
  const results: Array<{file: string,size:number}> = [];
  async function walk(curr: string) {
    try {
      const stats = await fs.stat(curr);
      if (stats.isFile()) {
        results.push({ file: curr, size: stats.size });
        return;
      }
      if (stats.isDirectory()) {
        const items = await fs.readdir(curr);
        for (const item of items) {
          await walk(path.join(curr, item));
        }
      }
    } catch (err) {
      // ignore
    }
  }
  await walk(p);
  results.sort((a,b) => b.size - a.size);
  return results.slice(0, limit);
}

export function showSizeHelp() {
  console.log(chalk.hex('#00d2d3')('\n🧾 Size Command\n'));
  console.log('Usage:');
  console.log('  size <path> [--top N]  # Show size of file/folder and top N largest files');
}

export async function sizeCommand(target?: string, options?: any) {
  try {
    displayCommandBanner('size', 'Show file or folder sizes');

    const p = target ? path.resolve(process.cwd(), target) : process.cwd();
    if (!await fs.pathExists(p)) {
      console.log(chalk.red(`❌ Path not found: ${p}`));
      return;
    }

    const stats = await fs.stat(p);
    if (stats.isFile()) {
      console.log(`${chalk.cyan('File:')} ${p}`);
      console.log(`${chalk.cyan('Size:')} ${chalk.bold(humanBytes(stats.size))}`);
      return;
    }

    console.log(`${chalk.cyan('Directory:')} ${p}`);
    const total = await folderSize(p);
    console.log(`${chalk.cyan('Total size:')} ${chalk.bold(humanBytes(total))}`);

    const top = options?.top ? Number(options.top) : 10;
    if (top > 0) {
      console.log(`\n${chalk.hex('#667eea')('Top ' + top + ' largest files:')}`);
      const largest = await listLargestFiles(p, top);
      largest.forEach((f, idx) => {
        console.log(`${String(idx+1).padStart(2)}. ${chalk.yellow(humanBytes(f.size)).padEnd(10)} ${chalk.gray(f.file)}`);
      });
    }

  } catch (err: any) {
    console.error(chalk.red('❌ Failed to calculate size:'), err.message || err);
    process.exit(1);
  }
}
