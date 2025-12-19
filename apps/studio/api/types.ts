export type ExtraTarget = {
  targetId: string;
  outputPath: string;
};

export type SvgConfig = {
  folder: string | null;
  inLock: boolean;
};

export type Config = {
  svg: SvgConfig;
  extraTargets: ExtraTarget[];
  svgo: any;
  prettier: any;
};

export type LockFileIcon = {
  title: string;
  tags: string[];
  svg: LockFileIconSvg;
  targets: Record<string, LockFileIconTarget>;
};

export type LockFileIconSvg = {
  content: string;
  hash: string;
};

export type LockFileIconTarget = {
  path: string;
  builtFrom: LockFileBuiltFrom;
};

export type LockFileBuiltFrom = {
  svgHash: string;
  configHash: string;
};

export type LockFile = {
  icons: Record<string, LockFileIcon>;
};

export type Change = {
  type:
    | "DELETE_FILE"
    | "CREATE_SVG_FILE"
    | "ADD_EXTRA_TARGET"
    | "REMOVE_EXTRA_TARGET"
    | "CHANGE_EXTRA_TARGET"
    | "FORMAT_FILES"
    | "REGENERATE_ALL";
  filePath?: string;
  iconKey?: string;
  targetId?: string;
};
