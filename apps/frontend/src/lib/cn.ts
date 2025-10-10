import { twMerge } from 'tailwind-merge';

type ClassValue = string | false | null | undefined | ClassValue[];

const toList = (value: ClassValue): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(toList);
  }
  return typeof value === 'string' ? [value] : [];
};

const isClassName = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export const cn = (...values: ClassValue[]): string => {
  const classes = values
    .flatMap(toList)
    .filter((token): token is string => isClassName(token));
  return twMerge(classes.join(' '));
};
