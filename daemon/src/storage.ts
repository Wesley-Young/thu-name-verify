import type { TsinghuaGitUserInfo } from 'thugit-oauth';

export const reqIdStorage = new Map<string, TsinghuaGitUserInfo>();
export const uinTokenStorage = new Map<
  number,
  {
    addedAt: number;
    reqId: string;
    userInfo: TsinghuaGitUserInfo;
  }
>();
