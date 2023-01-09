<template>
  <div class="wrapper">
    <div class="delete-wrapper">
      <button class="delete" @click="setSelectedValue(null)">x</button>
    </div>
    <v-menu v-if="!loading" attached>
      <template #activator="{ activate }">
        <v-input :readonly="readonly" :model-value="selectedText" @update:model-value="onSearchValueChanged"
          @focus="activate" @blur="clearSearchValue($event)">
        </v-input>
      </template>

      <!-- https://github.com/dimitrov-adrian/directus-extension-tags-m2m-interface/blob/main/src/interface.vue -->
      <!-- https://github.com/directus/directus/discussions/16993#discussioncomment-4585960 -->
      <v-list v-if="filteredOptions().length > 0">
        <v-list-item v-for="option of filteredOptions()" :key="option.value" clickable
          @click="() => setSelectedValue(option.value)">
          <v-list-item-content>{{ option.text }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">

import { defineComponent, ref, watch } from 'vue';
import { useItems, useStores } from "@directus/extensions-sdk";
import { Collection, Relation } from '@directus/shared/types';
import { FieldData } from "./field-data";
import { RelationFacade } from "./relation-facade";

const input = 'input';

/**
 * An example of a relational field can be found here:
 * https://github.com/directus/directus/blob/main/app/src/interfaces/select-dropdown-m2o/select-dropdown-m2o.vue
 * https://github.com/directus/directus/blob/main/app/src/views/private/components/drawer-collection.vue
 * https://github.com/directus/directus/blob/main/app/src/layouts/tabular/tabular.vue
 */
export default defineComponent({
  props: {
    value: {
      type: Number,
      default: null,
    },
    collection: {
      type: String,
    },
    field: {
      type: String,
    },
    fieldData: Object,
    template: String,
  },
  emits: [input],
  setup(props, { emit }) {
    const fieldData = props.fieldData as FieldData;
    const readonly = fieldData.meta.readonly;

    const { useRelationsStore, useCollectionsStore } = useStores();
    const relationsStore = useRelationsStore();
    const collectionsStore = useCollectionsStore();

    const relation: Relation = relationsStore.getRelationsForField(props.collection, props.field)[0];
    const relatedCollection: Collection = collectionsStore.getCollection(relation.related_collection);
    const facade = new RelationFacade(relation, relatedCollection);

    /**
     * https://github.com/directus/directus/discussions/16290
     * https://github.com/directus/directus/blob/6bf5de1f9d60996232ee2ff75ef480bdfdf34027/packages/shared/src/composables/use-items.ts
     */
    const { items, loading } = useItems(ref(relation.related_collection), {
      fields: ref(['*']),
      limit: ref(-1),
      sort: ref(null),
      search: ref(''),
      filter: ref(null),
      page: ref(1)
    });

    const allOptions = ref();
    const selectedValue = ref<number | null | undefined>(props.value);
    const selectedText = ref("");
    const filterValue = ref("");

    watch(items, newItems => {
      allOptions.value = newItems.map(item => ({ value: facade.getValue(item), text: facade.getText(item) }));
      updateTextAccordingToSelectedValue();
    }, { immediate: true })

    return {
      loading,
      readonly,
      allOptions,
      filterValue,
      selectedText,
      onSearchValueChanged,
      setSelectedValue,
      clearSearchValue,
    }

    function onSearchValueChanged(value: string): void {
      filterValue.value = value;
    }

    function setSelectedValue(newValue: number | null) {
      selectedValue.value = newValue;
      updateTextAccordingToSelectedValue();
      emit(input, newValue);
    }

    function updateTextAccordingToSelectedValue() {
      selectedText.value = getTextForSelectedValue();
    }

    function clearSearchValue(event: Event) {
      const inputField = event.target as any;
      const selectedText = getTextForSelectedValue();
      if (inputField.value !== selectedText) {
        inputField.value = selectedText || '';
      }
    }

    function getTextForSelectedValue() {
      return allOptions.value.find(item => item.value === selectedValue.value)?.text;
    }
  },

  /**
   * computed()-property is for some reason not recalculated, that's why method is used
   */
  methods: {
    filteredOptions() {
      if (this.readonly) return [];
      if (!this.filterValue) return this.allOptions;
      return this.allOptions.filter(option => option.text.toLowerCase().includes(this.filterValue.toLowerCase()));
    }
  }
});
</script>

<style>
.wrapper {
  position: relative;
}

.delete-wrapper {
  position: absolute;
  right: 1rem;
  top: 0;
  bottom: 0;
  z-index: 1;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.delete {
  font-size: 1.25rem;
  color: #d3dae4;
}

.delete:hover {
  color: #a2b5cd;
}
</style>
