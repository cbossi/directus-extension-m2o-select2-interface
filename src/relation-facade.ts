import { Collection, Item, Relation } from '@directus/shared/types';
import { DisplayTemplate } from './display-template';

export class RelationFacade {

  private readonly primaryKeyColumn: string | undefined;
  private readonly displayTemplate: DisplayTemplate | undefined;

  constructor(relation: Relation, collection: Collection) {
    this.primaryKeyColumn = relation.schema?.foreign_key_column;
    const displayTemplate = collection.meta?.display_template
    this.displayTemplate = displayTemplate ? new DisplayTemplate(displayTemplate) : undefined;
  }

  public getText(item: Item) {
    if (this.displayTemplate) {
      return this.displayTemplate.apply(item);
    }
    return this.getValue(item);
  }

  public getValue(item: Item) {
    if (this.primaryKeyColumn) {
      return item[this.primaryKeyColumn];
    }
    return JSON.stringify(item);
  }

}