import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectHeader } from "./_components/project-header";
import { ProjectTabs } from "./_components/project-tabs";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      status: true,
      address: true,
      description: true,
      createdAt: true,
      startDate: true,
      endDate: true,
      client: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
      manager: {
        select: {
          fullName: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <ProjectHeader project={project} />
      <ProjectTabs projectId={project.id} />
      {children}
    </div>
  );
}
