export type ProjectOwnership = "owned" | "shared";

export type EditorProject = {
  id: string;
  name: string;
  roomId: string;
  ownership: ProjectOwnership;
};

export type EditorProjectLists = {
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
};
