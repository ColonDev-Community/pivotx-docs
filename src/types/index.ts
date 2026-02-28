export interface DocVersion {
  version: string;
  label: string;
  sections: DocSection[];
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  subsections?: DocSection[];
}
