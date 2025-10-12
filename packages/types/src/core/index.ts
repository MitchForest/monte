import { z } from 'zod';

export type Id<TableName extends string = string> = string & { __tableName: TableName };

export const IdSchema = <TableName extends string = string>() =>
  z.string() as unknown as z.ZodType<Id<TableName>>;

