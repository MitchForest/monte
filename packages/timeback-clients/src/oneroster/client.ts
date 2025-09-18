import {
  callOperation,
  getOperationSpec,
  type OperationCallArgs,
  type OperationResponse,
} from "../http";
import type { CreateServiceClientOptions, ServiceClient } from "../internal";
import { createServiceClient } from "../internal";
import {
  operationSpecs,
  type OneRosterOperationAlias,
  type OneRosterOperationSpecs,
} from "./generated/operation-specs";

export type OneRosterClient = ServiceClient & { service: "oneroster" };
export type CreateOneRosterClientOptions = CreateServiceClientOptions;
export type OneRosterOperationArgs<
  Alias extends OneRosterOperationAlias = OneRosterOperationAlias,
> = OperationCallArgs<OneRosterOperationSpecs, Alias>;

export function createOneRosterClient(
  options: CreateOneRosterClientOptions = {},
): OneRosterClient {
  const client = createServiceClient("oneroster", options);
  return client as OneRosterClient;
}

export function getOneRosterOperation<TAlias extends OneRosterOperationAlias>(
  alias: TAlias,
) {
  return getOperationSpec(operationSpecs, alias);
}

export async function callOneRosterOperation<
  TAlias extends OneRosterOperationAlias,
>(
  client: OneRosterClient,
  alias: TAlias,
  args: OneRosterOperationArgs<TAlias>,
): Promise<OperationResponse<OneRosterOperationSpecs, TAlias>> {
  return callOperation(client, operationSpecs, alias, args);
}
