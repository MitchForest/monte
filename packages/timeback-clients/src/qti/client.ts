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
  type QtiOperationAlias,
  type QtiOperationSpecs,
} from "./generated/operation-specs";

export type QtiClient = ServiceClient & { service: "qti" };
export type CreateQtiClientOptions = CreateServiceClientOptions;
export type QtiOperationArgs<
  Alias extends QtiOperationAlias = QtiOperationAlias,
> = OperationCallArgs<QtiOperationSpecs, Alias>;

export function createQtiClient(
  options: CreateQtiClientOptions = {},
): QtiClient {
  const client = createServiceClient("qti", options);
  return client as QtiClient;
}

export function getQtiOperation<TAlias extends QtiOperationAlias>(alias: TAlias) {
  return getOperationSpec(operationSpecs, alias);
}

export async function callQtiOperation<TAlias extends QtiOperationAlias>(
  client: QtiClient,
  alias: TAlias,
  args: QtiOperationArgs<TAlias>,
): Promise<OperationResponse<QtiOperationSpecs, TAlias>> {
  return callOperation(client, operationSpecs, alias, args);
}
