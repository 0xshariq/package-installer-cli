import { cloneRepo as cloneRepoUtil } from '../utils/cloneUtils.js';

export async function cloneRepo(userRepo: string, projectName?: string) {
  await cloneRepoUtil(userRepo, projectName);
}
