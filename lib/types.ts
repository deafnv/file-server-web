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