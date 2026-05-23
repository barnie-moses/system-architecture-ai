export type ProjectCollaborator = {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type ProjectAccessPerson = ProjectCollaborator & {
  role: "owner" | "collaborator";
};

export type ProjectCollaboratorsResponse = {
  owner: ProjectAccessPerson | null;
  collaborators: ProjectAccessPerson[];
  canManage: boolean;
};
