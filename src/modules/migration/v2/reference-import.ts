import { ImportResult, ReferenceImportContext } from "../types";
import { importBrands } from "./importers/brands.importer";
import { importFixtureTypes } from "./importers/fixture-types.importer";
import { importLightingSystemTypes } from "./importers/lighting-system-types.importer";
import { importRoomTypes } from "./importers/room-types.importer";
import { importSkillTags } from "./importers/skill-tags.importer";
import { importWorkPriceListsAndItems } from "./importers/work-price-lists.importer";

export async function runV2ReferenceImport(
  context: ReferenceImportContext,
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  results.push(await importBrands(context));
  results.push(await importRoomTypes(context));
  results.push(await importSkillTags(context));
  results.push(await importLightingSystemTypes(context));
  results.push(await importFixtureTypes(context));
  results.push(await importWorkPriceListsAndItems(context));

  return results;
}
