"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addProjectTeamMember,
  removeProjectTeamMember,
  searchProjectAssignableUsers,
  setProjectTeamLead,
  updateProjectTeamMember,
} from "../actions";

type TeamUser = {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
};

type TeamMember = {
  id: string;
  roleLabel: string | null;
  isLead: boolean;
  joinedAt: Date | string;
  user: TeamUser;
};

type ProjectTeamManagerProps = {
  projectId: string;
  members: TeamMember[];
};

function resolveUserName(user: TeamUser | null | undefined) {
  if (!user) return "—";

  const fullName = user.fullName?.trim();
  if (fullName) return fullName;

  const composed = [user.firstName?.trim(), user.lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composed || "—";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

type ModalState =
  | { type: null }
  | { type: "add" }
  | { type: "edit"; member: TeamMember }
  | { type: "remove"; member: TeamMember };

export function ProjectTeamManager({
  projectId,
  members,
}: ProjectTeamManagerProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TeamUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [newIsLead, setNewIsLead] = useState(false);

  const [editRoleLabel, setEditRoleLabel] = useState("");

  const activeLeadId = useMemo(
    () => members.find((member) => member.isLead)?.id ?? null,
    [members],
  );

  function resetAddState() {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUserId("");
    setNewRoleLabel("");
    setNewIsLead(false);
    setError(null);
  }

  function openAddModal() {
    resetAddState();
    setModalState({ type: "add" });
  }

  function openEditModal(member: TeamMember) {
    setEditRoleLabel(member.roleLabel ?? "");
    setError(null);
    setModalState({ type: "edit", member });
  }

  function openRemoveModal(member: TeamMember) {
    setError(null);
    setModalState({ type: "remove", member });
  }

  function closeModal() {
    setModalState({ type: null });
    setError(null);
  }

  async function handleSearchUsers() {
    setError(null);

    try {
      const users = await searchProjectAssignableUsers({
        projectId,
        query: searchQuery,
      });

      setSearchResults(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося знайти користувачів.");
    }
  }

  async function handleAddMember() {
    setError(null);

    startTransition(async () => {
      try {
        await addProjectTeamMember({
          projectId,
          userId: selectedUserId,
          roleLabel: newRoleLabel,
          isLead: newIsLead,
        });

        closeModal();
        resetAddState();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не вдалося додати учасника.");
      }
    });
  }

  async function handleUpdateMember(member: TeamMember) {
    setError(null);

    startTransition(async () => {
      try {
        await updateProjectTeamMember({
          projectId,
          teamMemberId: member.id,
          roleLabel: editRoleLabel,
        });

        closeModal();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не вдалося оновити роль.");
      }
    });
  }

  async function handleSetLead(member: TeamMember) {
    setError(null);

    startTransition(async () => {
      try {
        await setProjectTeamLead({
          projectId,
          teamMemberId: member.id,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не вдалося призначити Lead.");
      }
    });
  }

  async function handleRemoveMember(member: TeamMember) {
    setError(null);

    startTransition(async () => {
      try {
        await removeProjectTeamMember({
          projectId,
          teamMemberId: member.id,
        });

        closeModal();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не вдалося прибрати учасника.");
      }
    });
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Команда проєкту
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
            Хто працює над об’єктом
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
            Тут зібрана активна команда проєкту. Можна додавати учасників,
            змінювати ролі, призначати Lead і прибирати людей із поточного складу.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Додати учасника
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {members.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-neutral-950">
                      {resolveUserName(member.user)}
                    </div>

                    {member.isLead ? (
                      <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[11px] font-semibold text-white">
                        Lead
                      </span>
                    ) : null}

                    {member.roleLabel ? (
                      <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                        {member.roleLabel}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500">
                    <span>{member.user.phone || "Без телефону"}</span>
                    <span>{member.user.email || "Без email"}</span>
                    <span>У команді з {formatDate(member.joinedAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
                  >
                    Змінити роль
                  </button>

                  {!member.isLead ? (
                    <button
                      type="button"
                      onClick={() => handleSetLead(member)}
                      disabled={isPending || activeLeadId === member.id}
                      className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Зробити Lead
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => openRemoveModal(member)}
                    className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Прибрати
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-sm text-neutral-500">
          У цьому проєкті ще немає активної команди. Додай учасників і признач
          Lead, щоб склад був зафіксований прямо в картці проєкту.
        </div>
      )}

      {modalState.type !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Керування командою
                </div>

                <h3 className="mt-2 text-lg font-semibold text-neutral-950">
                  {modalState.type === "add"
                    ? "Додати учасника"
                    : modalState.type === "edit"
                      ? "Змінити роль"
                      : "Прибрати учасника"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                Закрити
              </button>
            </div>

            <div className="px-6 py-5">
              {modalState.type === "add" ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-900">
                      Пошук користувача
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Ім’я, телефон або email"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
                      />
                      <button
                        type="button"
                        onClick={handleSearchUsers}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
                      >
                        Знайти
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-900">
                      Користувач
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
                    >
                      <option value="">Оберіть користувача</option>
                      {searchResults.map((user) => (
                        <option key={user.id} value={user.id}>
                          {resolveUserName(user)}{" "}
                          {user.phone ? `• ${user.phone}` : ""}
                          {user.email ? ` • ${user.email}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-900">
                      Роль у проєкті
                    </label>
                    <input
                      value={newRoleLabel}
                      onChange={(event) => setNewRoleLabel(event.target.value)}
                      placeholder="Наприклад: Електрик, Прораб, Підрядник"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={newIsLead}
                      onChange={(event) => setNewIsLead(event.target.checked)}
                    />
                    Призначити цього учасника як Lead
                  </label>
                </div>
              ) : null}

              {modalState.type === "edit" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <span className="font-medium text-neutral-900">Учасник:</span>{" "}
                    {resolveUserName(modalState.member.user)}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-900">
                      Роль у проєкті
                    </label>
                    <input
                      value={editRoleLabel}
                      onChange={(event) => setEditRoleLabel(event.target.value)}
                      placeholder="Наприклад: Електрик, Прораб, Підрядник"
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-950"
                    />
                  </div>
                </div>
              ) : null}

              {modalState.type === "remove" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Учасник буде прибраний з активної команди проєкту, але запис
                    залишиться в історії через `leftAt`.
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <span className="font-medium text-neutral-900">Учасник:</span>{" "}
                    {resolveUserName(modalState.member.user)}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-950"
              >
                Скасувати
              </button>

              {modalState.type === "add" ? (
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={isPending || !selectedUserId}
                  className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Додати
                </button>
              ) : null}

              {modalState.type === "edit" ? (
                <button
                  type="button"
                  onClick={() => handleUpdateMember(modalState.member)}
                  disabled={isPending}
                  className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Зберегти
                </button>
              ) : null}

              {modalState.type === "remove" ? (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(modalState.member)}
                  disabled={isPending}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Прибрати
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
