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

export async function showSizeHelp() {
  const { createStandardHelp } = await import('../utils/helpFormatter.js');
  const helpConfig = {
    commandName: 'Size',
    emoji: '📏',
    description: 'Show size of files and directories. Supports multiple paths and summary output.',
    usage: ['size [paths...]', 'size -a [paths...]', 'size --top <n> [paths...]'],
    options: [
      { flag: '-a, --all', description: 'Show sizes for all files and folders (verbose)' },
      { flag: '--top <n>', description: 'Show top N largest files (default 10)' },
      { flag: '--json', description: 'Output machine-readable JSON' }
    ],
    examples: [
      { command: 'size .', description: 'Show size for current directory' },
      { command: 'size src package.json', description: 'Show sizes for multiple paths' },
      { command: 'size -a src', description: 'List all files and folders sizes under src' }
    ]
  };

  // createStandardHelp is exported as named function; call it
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createStandardHelp(helpConfig as any);
}

export async function sizeCommand(targets?: string[] | string, options?: any) {
  try {
    displayCommandBanner('size', 'Show file or folder sizes');

    // Normalize targets to an array
    let paths: string[] = [];
    if (!targets) {
      paths = ['.'];
    } else if (Array.isArray(targets)) {
      paths = targets.length === 0 ? ['.'] : targets;
    } else if (typeof targets === 'string') {
      paths = [targets];
    }

    // Resolve and dedupe
    paths = Array.from(new Set(paths.map(p => p === '.' ? process.cwd() : path.resolve(process.cwd(), p))));

  const topN = options?.top ? Number(options.top) : 10;
  const showAll = !!options?.all;
  const jsonOutput = !!options?.json;

    let combinedTotal = 0;
    const combinedFiles: Array<{file:string,size:number}> = [];

  const resultsPerPath: Array<any> = [];
  for (const p of paths) {
      if (!await fs.pathExists(p)) {
        console.log(chalk.red(`❌ Path not found: ${p}`));
        continue;
      }

      const stats = await fs.stat(p);
      if (stats.isFile()) {
        const entry = { path: p, type: 'file', size: stats.size };
        if (jsonOutput) resultsPerPath.push(entry);
        else {
          console.log(`\n${chalk.cyan('File:')} ${p}`);
          console.log(`${chalk.cyan('Size:')} ${chalk.bold(humanBytes(stats.size))}`);
        }
        combinedTotal += stats.size;
        combinedFiles.push({ file: p, size: stats.size });
        continue;
      }

      const total = await folderSize(p);
      combinedTotal += total;
      if (jsonOutput) resultsPerPath.push({ path: p, type: 'directory', size: total });
      else {
        console.log(`\n${chalk.cyan('Directory:')} ${p}`);
        console.log(`${chalk.cyan('Total size:')} ${chalk.bold(humanBytes(total))}`);
      }

      if (showAll) {
        // Walk directory and print sizes for every file and nested folder
        if (!jsonOutput) console.log(chalk.hex('#00d2d3')('\nListing all files and folders with sizes (may be verbose):'));
        async function walkAndPrint(curr: string) {
          try {
            const s = await fs.stat(curr);
            if (s.isFile()) {
              if (jsonOutput) resultsPerPath.push({ path: curr, type: 'file', size: s.size });
              else console.log(`${chalk.yellow(humanBytes(s.size)).padEnd(10)} ${chalk.gray(curr)}`);
              combinedFiles.push({ file: curr, size: s.size });
              return;
            }
            if (s.isDirectory()) {
              const items = await fs.readdir(curr);
              let folderTotal = 0;
              for (const it of items) {
                const ip = path.join(curr, it);
                const childSize = await folderSize(ip);
                folderTotal += childSize;
                await walkAndPrint(ip);
              }
              if (jsonOutput) resultsPerPath.push({ path: curr, type: 'directory', size: folderTotal });
              else console.log(`${chalk.blue('Dir Total:')} ${chalk.bold(humanBytes(folderTotal)).padEnd(10)} ${chalk.gray(curr)}`);
            }
          } catch (err) {
            // ignore
          }
        }
        await walkAndPrint(p);
      } else if (topN > 0) {
        const largest = await listLargestFiles(p, topN);
        if (jsonOutput) {
          const last = resultsPerPath[resultsPerPath.length - 1];
          if (last) last.top = largest.map(f => ({ file: f.file, size: f.size }));
        } else {
          console.log(`\n${chalk.hex('#667eea')('Top ' + topN + ' largest files in ' + p + ':')}`);
          largest.forEach((f, idx) => {
            console.log(`${String(idx+1).padStart(2)}. ${chalk.yellow(humanBytes(f.size)).padEnd(10)} ${chalk.gray(f.file)}`);
            combinedFiles.push(f);
          });
        }
      }
    }

    // JSON output
    if (jsonOutput) {
      const uniqCombined = Array.from(new Map(combinedFiles.map(f => [f.file, f])).values());
      uniqCombined.sort((a,b) => b.size - a.size);
      const out = {
        scannedPaths: paths,
        perPath: resultsPerPath,
        combinedSize: combinedTotal,
        topFiles: uniqCombined.slice(0, topN).map(f => ({ file: f.file, size: f.size }))
      };
      console.log(JSON.stringify(out, null, 2));
      return;
    }

    // Combined summary (human)
    if (paths.length > 1) {
      console.log('\n' + chalk.hex('#00d2d3')('📦 Combined Summary'));
      console.log(`${chalk.cyan('Paths scanned:')} ${paths.length}`);
      console.log(`${chalk.cyan('Combined size:')} ${chalk.bold(humanBytes(combinedTotal))}`);

      if (topN > 0 && combinedFiles.length > 0) {
        const uniqCombined = Array.from(new Map(combinedFiles.map(f => [f.file, f])).values());
        uniqCombined.sort((a,b) => b.size - a.size);
        console.log(`\n${chalk.hex('#667eea')('Top ' + topN + ' largest files across all inputs:')}`);
        uniqCombined.slice(0, topN).forEach((f, idx) => {
          console.log(`${String(idx+1).padStart(2)}. ${chalk.yellow(humanBytes(f.size)).padEnd(10)} ${chalk.gray(f.file)}`);
        });
      }
    }

  } catch (err: any) {
    console.error(chalk.red('❌ Failed to calculate size:'), err.message || err);
    process.exit(1);
  }
}
