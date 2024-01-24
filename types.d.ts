export interface RegisterOptions {
  bootstrap?: Model[];
  idKey?: string;
}

export interface Model {
  name: string;
  schema: any;
}

export interface DefaultHandlerOpts {
  model: Function;
  preQuery?: Function;
  transformResponse?: Function;
  type:
    | "getOne"
    | "getAll"
    | "getAllPaginated"
    | "post"
    | "put"
    | "patch"
    | "delete";
}
