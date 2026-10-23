import { useState, type FormEvent } from "react";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import { activateLocale, LOCALES, type Locale } from "./i18n.ts";

type Role = "admin" | "editor" | "viewer";

type Member = {
  name: string;
  email: string;
  role: Role;
};

const ROLES: Role[] = ["admin", "editor", "viewer"];

const TEAM_NAME = "Northwind";

const PENDING_INVITES = ["maja@northwind.example", "tomasz@northwind.example"];

const INITIAL_MEMBERS: Member[] = [
  { name: "Ada Lovelace", email: "ada@northwind.example", role: "admin" },
  { name: "Grace Hopper", email: "grace@northwind.example", role: "editor" },
  { name: "Alan Turing", email: "alan@northwind.example", role: "viewer" }
];

export function App() {
  const { t, i18n } = useLingui();
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const roleLabels: Record<Role, string> = {
    admin: t`Admin`,
    editor: t`Editor`,
    viewer: t`Viewer`
  };

  const teamName = TEAM_NAME;
  const memberCount = members.length;
  const visibleMembers = members.filter((member) =>
    member.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function changeRole(email: string, role: Role) {
    setMembers((current) =>
      current.map((member) => (member.email === email ? { ...member, role } : member))
    );
  }

  function removeMember(email: string) {
    setMembers((current) => current.filter((member) => member.email !== email));
  }

  function sendInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvitedEmail(inviteEmail);
    setInviteEmail("");
  }

  return (
    <main>
      <header>
        <div>
          <h1>
            <Trans>Team settings</Trans>
          </h1>
          <p>
            <Trans>Manage who has access to {teamName}.</Trans>
          </p>
        </div>
        <label className="language">
          <Trans>Language</Trans>
          <select
            value={i18n.locale}
            onChange={(event) => activateLocale(event.target.value as Locale)}
          >
            {Object.entries(LOCALES).map(([code, name]) => (
              <option key={code} value={code} lang={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section>
        <h2>
          <Trans>Members</Trans>
        </h2>
        <p className="count">
          <Plural value={memberCount} _0="No members yet" one="# member" other="# members" />
        </p>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t`Search members`}
          aria-label={t`Search members`}
        />
        <ul>
          {visibleMembers.map((member) => (
            <li key={member.email}>
              <span className="member">
                <strong>{member.name}</strong>
                <span>{member.email}</span>
              </span>
              <select
                value={member.role}
                onChange={(event) => changeRole(member.email, event.target.value as Role)}
                aria-label={t`Role`}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => removeMember(member.email)}>
                <Trans comment="Button that removes a person from the team">Remove</Trans>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>
          <Trans>Invite someone</Trans>
        </h2>
        <form onSubmit={sendInvite}>
          <label>
            <Trans>Email address</Trans>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
            />
          </label>
          <label>
            <Trans>Role</Trans>
            <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as Role)}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">
            <Trans>Send invite</Trans>
          </button>
        </form>
        {invitedEmail && (
          <p role="status">
            <Trans>Invitation sent to {invitedEmail}.</Trans>
          </p>
        )}
        <h3>
          <Trans>Pending invites</Trans>
        </h3>
        <p className="count">
          <Plural
            value={PENDING_INVITES.length}
            _0="No pending invites"
            one="# invite waiting for a reply"
            other="# invites waiting for a reply"
          />
        </p>
        <ul>
          {PENDING_INVITES.map((email) => (
            <li key={email}>
              <span>{email}</span>
              <button type="button">
                <Trans>Resend</Trans>
              </button>
              <button type="button">
                <Trans>Revoke</Trans>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
