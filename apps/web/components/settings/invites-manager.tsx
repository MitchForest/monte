"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createWorkspaceInvite,
  listWorkspaceInvites,
  sendWorkspaceInvite,
} from "@/lib/api/endpoints";

const ROLES = [
  { value: "teacher", label: "Guide" },
  { value: "administrator", label: "Administrator" },
  { value: "parent", label: "Family" },
  { value: "student", label: "Student" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];

export function InvitesManager() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleValue>("teacher");
  const [expiresInDays, setExpiresInDays] = useState<number | "">(14);
  const [maxUses, setMaxUses] = useState<number | "">(1);
  const [sendNow, setSendNow] = useState(true);

  const invitesQuery = useQuery({
    queryKey: ["workspace-invites"],
    queryFn: () => listWorkspaceInvites(),
  });

  const createInviteMutation = useMutation({
    mutationFn: createWorkspaceInvite,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-invites"] });
      if (variables.email && sendNow) {
        try {
          await sendWorkspaceInvite(data.invite.id, variables.email);
          toast.success("Invite email sent");
        } catch (_error) {
          toast.error("Invite created but email failed to send");
        }
      } else {
        toast.success("Invite created");
      }
      setEmail("");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to create invite",
      );
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: ({ id, email: inviteEmail }: { id: string; email?: string }) =>
      sendWorkspaceInvite(id, inviteEmail),
    onSuccess: () => {
      toast.success("Invite email sent");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Unable to send invite",
      );
    },
  });

  const handleCreateInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createInviteMutation.mutate({
      email: email.trim() || undefined,
      role,
      expiresInDays:
        typeof expiresInDays === "number" ? expiresInDays : undefined,
      maxUses: typeof maxUses === "number" ? maxUses : undefined,
    });
  };

  const handleCopyCode = async (code: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard access is not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Invite code copied to clipboard");
    } catch {
      toast.error("Unable to copy invite code");
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Invite teammates</h2>
          <p className="text-muted-foreground text-sm">
            Generate invite codes or send emails directly from Monte.
          </p>
        </div>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleCreateInvite}
        >
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email (optional)</Label>
            <Input
              id="invite-email"
              placeholder="guide@monteschool.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as RoleValue)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-expires">Expires in (days)</Label>
            <Input
              id="invite-expires"
              min={1}
              max={90}
              type="number"
              value={expiresInDays === "" ? "" : expiresInDays}
              onChange={(event) => {
                const value = event.target.value;
                setExpiresInDays(
                  value === "" ? "" : Number.parseInt(value, 10),
                );
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-uses">Max uses</Label>
            <Input
              id="invite-uses"
              min={1}
              max={10}
              type="number"
              value={maxUses === "" ? "" : maxUses}
              onChange={(event) => {
                const value = event.target.value;
                setMaxUses(value === "" ? "" : Number.parseInt(value, 10));
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm" htmlFor="send-now">
            <input
              checked={sendNow}
              id="send-now"
              onChange={(event) => setSendNow(event.target.checked)}
              type="checkbox"
            />
            Email invite immediately when an address is provided
          </label>
          <div className="md:col-span-2">
            <Button disabled={createInviteMutation.isPending} type="submit">
              {createInviteMutation.isPending ? "Creating..." : "Create invite"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Active codes</h3>
        {invitesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading invites…</p>
        ) : invitesQuery.data && invitesQuery.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Expires</th>
                  <th className="px-4 py-2">Uses</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {invitesQuery.data.map((invite) => (
                  <tr key={invite.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm tracking-widest">
                      {invite.code}
                    </td>
                    <td className="px-4 py-2">{invite.email ?? "—"}</td>
                    <td className="px-4 py-2 capitalize">{invite.role}</td>
                    <td className="px-4 py-2">
                      {invite.expires_at
                        ? new Date(invite.expires_at).toLocaleDateString()
                        : "No expiry"}
                    </td>
                    <td className="px-4 py-2">
                      {invite.used_count}/{invite.max_uses}
                    </td>
                    <td className="px-4 py-2">
                      {invite.email ? (
                        <Button
                          disabled={
                            sendInviteMutation.isPending &&
                            sendInviteMutation.variables?.id === invite.id
                          }
                          variant="outline"
                          type="button"
                          onClick={() =>
                            sendInviteMutation.mutate({
                              id: invite.id,
                              email: invite.email ?? undefined,
                            })
                          }
                        >
                          {sendInviteMutation.isPending &&
                          sendInviteMutation.variables?.id === invite.id
                            ? "Sending…"
                            : "Email code"}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => handleCopyCode(invite.code)}
                        >
                          Copy code
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No invites generated yet. Create a code to invite guides and
            families.
          </p>
        )}
      </section>
    </div>
  );
}
