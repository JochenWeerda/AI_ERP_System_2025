/**
 * components.js
 * Gemeinsame UI-Komponenten als Templates
 */
import { xml } from "@odoo/owl";

/**
 * Button-Komponente
 */
export const BUTTON_TEMPLATE = xml`
<button 
  t-att-id="props.id" 
  t-att-class="computedClass" 
  t-att-type="props.type || 'button'"
  t-att-disabled="props.disabled"
  t-on-click="onClick"
  t-att-title="props.title"
  t-att-data-action="props.action">
  <i t-if="props.icon" t-att-class="props.icon + ' button-icon'"></i>
  <span t-if="props.label" class="button-label"><t t-esc="props.label"/></span>
  <slot/>
</button>
`;

/**
 * Input-Komponente
 */
export const INPUT_TEMPLATE = xml`
<div class="owl-input-group" t-att-class="{ 'has-error': hasError }">
  <label t-if="props.label" t-att-for="props.id" class="input-label">
    <t t-esc="props.label"/>
    <span t-if="props.required" class="required-marker">*</span>
  </label>
  
  <div class="input-container">
    <input 
      t-att-id="props.id"
      t-att-name="props.name"
      t-att-type="props.type || 'text'"
      t-att-placeholder="props.placeholder"
      t-att-value="props.modelValue"
      t-att-disabled="props.disabled"
      t-att-readonly="props.readonly"
      t-att-maxlength="props.maxlength"
      t-att-class="inputClass"
      t-on-input="onInput"
      t-on-blur="onBlur"
      t-on-focus="onFocus"
      t-ref="input"
    />
    
    <div t-if="props.showClear && props.modelValue" 
         class="clear-button" 
         t-on-click="onClear">
      <i class="fas fa-times"></i>
    </div>
    
    <div t-if="props.icon" class="input-icon">
      <i t-att-class="props.icon"></i>
    </div>
  </div>
  
  <div t-if="errorMessage" class="error-message">
    <t t-esc="errorMessage"/>
  </div>
  
  <div t-if="props.hint" class="input-hint">
    <t t-esc="props.hint"/>
  </div>
</div>
`;

/**
 * Select-Komponente
 */
export const SELECT_TEMPLATE = xml`
<div class="owl-select-group" t-att-class="{ 'has-error': hasError }">
  <label t-if="props.label" t-att-for="props.id" class="select-label">
    <t t-esc="props.label"/>
    <span t-if="props.required" class="required-marker">*</span>
  </label>
  
  <div class="select-container">
    <select 
      t-att-id="props.id"
      t-att-name="props.name"
      t-att-disabled="props.disabled"
      t-att-class="selectClass"
      t-on-change="onChange"
      t-ref="select">
      
      <option t-if="props.placeholder" value="" t-att-selected="!props.modelValue">
        <t t-esc="props.placeholder"/>
      </option>
      
      <t t-foreach="props.options" t-as="option" t-key="option_index">
        <option 
          t-att-value="option.value" 
          t-att-selected="props.modelValue === option.value">
          <t t-esc="option.label"/>
        </option>
      </t>
    </select>
    
    <div class="select-arrow">
      <i class="fas fa-chevron-down"></i>
    </div>
  </div>
  
  <div t-if="errorMessage" class="error-message">
    <t t-esc="errorMessage"/>
  </div>
  
  <div t-if="props.hint" class="select-hint">
    <t t-esc="props.hint"/>
  </div>
</div>
`;

/**
 * Checkbox-Komponente
 */
export const CHECKBOX_TEMPLATE = xml`
<div class="owl-checkbox-group" t-att-class="{ 'has-error': hasError }">
  <div class="checkbox-container">
    <input 
      type="checkbox"
      t-att-id="props.id"
      t-att-name="props.name"
      t-att-checked="props.modelValue"
      t-att-disabled="props.disabled"
      t-on-change="onChange"
      t-ref="checkbox"
    />
    
    <label t-if="props.label" t-att-for="props.id" class="checkbox-label">
      <t t-esc="props.label"/>
      <span t-if="props.required" class="required-marker">*</span>
    </label>
  </div>
  
  <div t-if="errorMessage" class="error-message">
    <t t-esc="errorMessage"/>
  </div>
  
  <div t-if="props.hint" class="checkbox-hint">
    <t t-esc="props.hint"/>
  </div>
</div>
`;

/**
 * Radio-Komponente
 */
export const RADIO_GROUP_TEMPLATE = xml`
<div class="owl-radio-group" t-att-class="{ 'has-error': hasError }">
  <div t-if="props.label" class="radio-group-label">
    <t t-esc="props.label"/>
    <span t-if="props.required" class="required-marker">*</span>
  </div>
  
  <div class="radio-options">
    <div t-foreach="props.options" t-as="option" t-key="option_index" class="radio-option">
      <input 
        type="radio"
        t-att-id="props.id + '_' + option_index"
        t-att-name="props.name"
        t-att-value="option.value"
        t-att-checked="props.modelValue === option.value"
        t-att-disabled="props.disabled || option.disabled"
        t-on-change="() => this.onChange(option.value)"
      />
      
      <label t-att-for="props.id + '_' + option_index" class="radio-label">
        <t t-esc="option.label"/>
      </label>
    </div>
  </div>
  
  <div t-if="errorMessage" class="error-message">
    <t t-esc="errorMessage"/>
  </div>
  
  <div t-if="props.hint" class="radio-hint">
    <t t-esc="props.hint"/>
  </div>
</div>
`;

/**
 * Tabelle-Komponente
 */
export const TABLE_TEMPLATE = xml`
<div class="owl-table-container">
  <table t-att-class="tableClass">
    <thead t-if="columns.length">
      <tr>
        <th t-if="props.selectable" class="selection-column">
          <input 
            t-if="props.selectAll"
            type="checkbox" 
            t-att-checked="allSelected" 
            t-on-change="toggleSelectAll"
          />
        </th>
        
        <th t-foreach="columns" t-as="column" t-key="column_index"
            t-att-class="{ 'sortable': column.sortable }"
            t-on-click="column.sortable ? () => this.onSort(column.key) : null">
          <div class="th-content">
            <t t-esc="column.label"/>
            
            <span t-if="column.sortable" class="sort-icon">
              <i t-if="sortKey === column.key && sortOrder === 'asc'" class="fas fa-sort-up"></i>
              <i t-elif="sortKey === column.key && sortOrder === 'desc'" class="fas fa-sort-down"></i>
              <i t-else class="fas fa-sort"></i>
            </span>
          </div>
        </th>
        
        <th t-if="hasActions" class="actions-column">Aktionen</th>
      </tr>
    </thead>
    
    <tbody>
      <tr t-if="isEmptyTable" class="empty-row">
        <td t-att-colspan="computedColspan">
          <slot name="empty">Keine Daten vorhanden</slot>
        </td>
      </tr>
      
      <t t-else t-foreach="tableData" t-as="row" t-key="row_index">
        <tr t-att-class="{ 'selected': isSelected(row) }">
          <td t-if="props.selectable" class="selection-column">
            <input 
              type="checkbox" 
              t-att-checked="isSelected(row)" 
              t-on-change="() => this.toggleSelect(row)"
            />
          </td>
          
          <td t-foreach="columns" t-as="column" t-key="column_index">
            <slot t-att-name="'cell-' + column.key" t-props="{ row, column }">
              <t t-esc="getCellValue(row, column)"/>
            </slot>
          </td>
          
          <td t-if="hasActions" class="actions-column">
            <slot name="row-actions" t-props="{ row }"/>
          </td>
        </tr>
      </t>
    </tbody>
  </table>
</div>
`;

/**
 * Modal-Komponente
 */
export const MODAL_TEMPLATE = xml`
<div t-if="state.isOpen" class="owl-modal-overlay" t-on-click="onOverlayClick">
  <div class="owl-modal-container" t-att-class="props.size" t-on-click.stop="">
    <div class="owl-modal-header">
      <h3 t-if="props.title" class="modal-title">
        <t t-esc="props.title"/>
      </h3>
      
      <button t-if="props.closable" class="modal-close-button" t-on-click="close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="owl-modal-body">
      <slot/>
    </div>
    
    <div t-if="hasFooter" class="owl-modal-footer">
      <slot name="footer">
        <button t-if="props.showCancelButton" 
                t-on-click="close" 
                class="btn btn-secondary">
          <t t-esc="props.cancelText"/>
        </button>
        
        <button t-if="props.showConfirmButton" 
                t-on-click="confirm" 
                class="btn btn-primary">
          <t t-esc="props.confirmText"/>
        </button>
      </slot>
    </div>
  </div>
</div>
`;

/**
 * Alert-Komponente
 */
export const ALERT_TEMPLATE = xml`
<div t-if="state.isVisible" 
     class="owl-alert" 
     t-att-class="alertClass"
     role="alert">
  <div class="alert-icon" t-if="props.showIcon">
    <i t-if="props.type === 'success'" class="fas fa-check-circle"></i>
    <i t-elif="props.type === 'info'" class="fas fa-info-circle"></i>
    <i t-elif="props.type === 'warning'" class="fas fa-exclamation-triangle"></i>
    <i t-elif="props.type === 'error'" class="fas fa-times-circle"></i>
  </div>
  
  <div class="alert-content">
    <div t-if="props.title" class="alert-title">
      <t t-esc="props.title"/>
    </div>
    
    <div class="alert-message">
      <slot/>
    </div>
  </div>
  
  <button t-if="props.dismissible" 
          class="alert-close" 
          t-on-click="dismiss">
    <i class="fas fa-times"></i>
  </button>
</div>
`;

export default {
  BUTTON_TEMPLATE,
  INPUT_TEMPLATE,
  SELECT_TEMPLATE,
  CHECKBOX_TEMPLATE,
  RADIO_GROUP_TEMPLATE,
  TABLE_TEMPLATE,
  MODAL_TEMPLATE,
  ALERT_TEMPLATE
};

