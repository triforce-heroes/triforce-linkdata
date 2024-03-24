interface LinkDataEntryBase {
  index: number;
  name: string;
  data: Buffer;
}

export type LinkDataEntry =
  | LinkDataEntryBase
  | (LinkDataEntryBase & {
      indexSub: number;
      raw: boolean;
    });
