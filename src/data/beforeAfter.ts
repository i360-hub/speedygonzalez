import data from './before-after.json';

export type BeforeAfterPair = {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
  caption: string;
};

export const pairs: BeforeAfterPair[] = data.pairs;

export const pairById = (id: string) => pairs.find((p) => p.id === id);
