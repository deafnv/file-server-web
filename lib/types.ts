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
  fileArr: FileServerFile[] | string | null; fileListRef: RefObject<HTMLDivElement>; 
  contextMenu:  'file' | 'directory' | null; 
  setContextMenu: Dispatch<SetStateAction<'file' | 'directory' | null>>; 
  selectedFile:  FileServerFile[]; 
  setSelectedFile: Dispatch<SetStateAction<FileServerFile[]>>;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
}

export interface UploadsListProps {
  currentUploadProgress: UploadProgress | null;
  uploadQueue: File[] | null;
  handleOpenFileDialog: () => void;
}

export interface FileTreeProps {
  fileTree: FileTreeRes;
  level?: number;
  prevDir?: string;
  onFileClick?: (filePath: string) => void;
  expand1?: string[];
};

export interface DragSelectionAreaProps {
  fileListRef: RefObject<HTMLDivElement>;
  fileArr: string | FileServerFile[] | null;
  selectedFile: FileServerFile[];
  setSelectedFile:  Dispatch<SetStateAction<FileServerFile[]>>;
  startingFileSelect: MutableRefObject<number | null>;
}