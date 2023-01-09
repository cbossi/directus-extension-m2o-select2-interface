import { Item } from "@directus/shared/types";

const displayTemplateSplitter = /({{.*?}})/g;

export class DisplayTemplate {

  constructor(private readonly displayTemplate: string) {
  }

  /**
   * This is a highly simplified version of the render-template component of directus that applies a display template to a given item:
   * https://github.com/directus/directus/blob/main/app/src/views/private/components/render-template.vue
   *
   * This is required, since directus does not provide a possibility to apply a displayTemplate in code.
   *
   * This method only takes the toString-representation of fields without applying any field-type specific logic to it and does NOT support Array-fields.
   */
  public apply(item: Item): string {
    return this.displayTemplate.split(displayTemplateSplitter).map(part => {
      if (!part.startsWith('{{')) return part;

      const fieldKey = part.replace(/{{/g, '').replace(/}}/g, '').trim();
      const value = item[fieldKey];

      if (value === undefined) return `<${fieldKey}>` // this is the case if a field with the given fieldKey does NOT exist
      if (value === null) return '' // this is the case, if the fieldKey references an existing field, but the item has no value set for the field

      return value;
    }).join('');
  }

}
