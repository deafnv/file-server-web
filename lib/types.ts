import { Dispatch, RefObject, SetStateAction, MutableRefObject } from 'react'
import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';

interface NavLinksWithDropdown {
	name: string;
  posLeft: string;
  dropdown: { name: string; route: string }[];
  route?: never;
}

interface NavLinksWithRoute {
	name: string;
  route: string;
  posLeft?: never;
  dropdown?: never;
}

export type NavLinks = NavLinksWithDropdown | NavLinksWithRoute;

export interface FileServerFile {
  name: string;
  path: string;
  created: string;
  modified: string;
  isDirectory: boolean;
  size: number;
}

export interface UploadProgress {
  name: string;
  progress: number;
}

export interface StorageSpaceRes {
  free: number;
  size: number;
}

export interface FileTreeRes {
  [key: string]: FileTreeRes;
}

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FileListProps { 
  fileArr: FileServerFile[] | string | null; 
  fileListRef: RefObject<HTMLDivElement>; 
  fileRefs: MutableRefObject<Array<{ file: FileServerFile; ref: HTMLDivElement; }>>;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
}

export interface UploadQueueItem {
  file: File;
  uploadTo: string;
}

export interface UploadsListProps {
  setFilesToUpload: (val: UploadQueueItem[]) => void;
  currentUploadProgress: UploadProgress | null;
  uploadQueue: UploadQueueItem[];
  handleOpenFileDialog: () => void;
}

export interface FileTreeProps {
  fileTree: FileTreeRes | string;
  level?: number;
  prevDir?: string;
  onFileClick?: (filePath: string) => void;
  expand1?: string[];
};

export interface DragSelectionAreaProps {
  fileListRef: RefObject<HTMLDivElement>;
  fileArr: string | FileServerFile[] | null;
}

export interface UserData {
  username: string;
  rank: number;
  permissions: {
    "makedir": boolean;
    "upload": boolean;
    "rename": boolean;
    "copy": boolean;
    "move": boolean;
    "delete": boolean;
  };
  created_at: string;
}

export const sleep = (s = 1) => new Promise((r) => setTimeout(r, s * 1000))