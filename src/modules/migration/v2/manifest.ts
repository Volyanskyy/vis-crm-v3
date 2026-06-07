import { V2ReferenceImportTask } from "../types";

export const v2ReferenceManifest: V2ReferenceImportTask[] = [
  {
    key: "brands",
    sourceFile: "brands_catalog.csv",
    target: "Brand",
  },
  {
    key: "room-types",
    sourceFile: "room_types_catalog.csv",
    target: "RoomType",
  },
  {
    key: "skill-tags",
    sourceFile: "skills_catalog.csv",
    target: "SkillTag",
  },
  {
    key: "lighting-system-types",
    sourceFile: "lighting_system_types.csv",
    target: "LightingSystemType",
  },
  {
    key: "fixture-types",
    sourceFile: "fixture_point_types.csv",
    target: "FittingType",
  },
  {
    key: "work-price-lists",
    sourceFile: "work_price_lists.csv",
    target: "WorkPriceList + WorkPriceItem",
  },
];
