import type { Component } from 'solid-js';
import { For, createMemo } from 'solid-js';
import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
} from '@tanstack/solid-table';

type Row = {
  id: string;
  label: string;
};

const columns: ColumnDef<Row>[] = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Label',
    accessorKey: 'label',
  },
];

const TableRoute: Component = () => {
  const data = createMemo<Row[]>(() => []);

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold text-neutral-100">Table Workspace</h1>
      <p class="text-sm text-neutral-400">
        Populate `data()` from Convex queries and extend column definitions as needed.
      </p>
      <div class="overflow-hidden rounded-md border border-white/10">
        <table class="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead class="bg-white/5 text-neutral-400">
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th class="px-4 py-2 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody class="divide-y divide-white/10 text-neutral-200">
            <For
              each={table.getRowModel().rows}
              fallback={<tr><td class="px-4 py-6 text-center text-xs text-neutral-500" colSpan={columns.length}>No data yet</td></tr>}
            >
              {(row) => (
                <tr>
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td class="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TableRoute;
