"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createSkillTagAction(formData: FormData) {
  const code = clean(formData.get("code"));
  const name = clean(formData.get("name"));

  if (!code) {
    throw new Error("Код навички обовʼязковий.");
  }

  if (!name) {
    throw new Error("Назва навички обовʼязкова.");
  }

  const existingByCode = await prisma.skillTag.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existingByCode) {
    throw new Error("Навичка з таким кодом уже існує.");
  }

  const existingByName = await prisma.skillTag.findFirst({
    where: { name },
    select: { id: true },
  });

  if (existingByName) {
    throw new Error("Навичка з такою назвою вже існує.");
  }

  await prisma.skillTag.create({
     data:{
      code,
      name,
      description: clean(formData.get("description")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/skill-tags");
}

export async function updateSkillTagAction(formData: FormData) {
  const id = clean(formData.get("id"));
  const code = clean(formData.get("code"));
  const name = clean(formData.get("name"));

  if (!id) {
    throw new Error("Не передано id навички.");
  }

  if (!code) {
    throw new Error("Код навички обовʼязковий.");
  }

  if (!name) {
    throw new Error("Назва навички обовʼязкова.");
  }

  const current = await prisma.skillTag.findUnique({
    where: { id },
    select: { id: true, code: true, name: true },
  });

  if (!current) {
    throw new Error("Навичку не знайдено.");
  }

  if (current.code !== code) {
    const existingByCode = await prisma.skillTag.findUnique({
      where: { code },
      select: { id: true },
    });

    if (existingByCode) {
      throw new Error("Інша навичка з таким кодом уже існує.");
    }
  }

  if (current.name !== name) {
    const existingByName = await prisma.skillTag.findFirst({
      where: { name },
      select: { id: true },
    });

    if (existingByName) {
      throw new Error("Інша навичка з такою назвою вже існує.");
    }
  }

  await prisma.skillTag.update({
    where: { id },
     data:{
      code,
      name,
      description: clean(formData.get("description")),
    },
  });

  revalidatePath("/references");
  revalidatePath("/references/skill-tags");
}
