/**
 * layout.js
 * Enthält Standard-Layouts für Module
 */
import { xml } from "@odoo/owl";

/**
 * Basis-Layout für Module
 * Enthält Header, Content und Footer-Bereich
 */
export const MODULE_LAYOUT = xml`
<div class="owl-module" t-att-class="props.className" t-att-data-module-id="props.moduleId">
  <div class="owl-module-header">
    <h3 t-if="moduleInfo.title"><t t-esc="moduleInfo.title"/></h3>
    <div class="module-actions" t-if="moduleInfo.showHeaderActions">
      <slot name="headerActions"/>
    </div>
  </div>
  
  <div class="owl-module-content">
    <div t-if="state.isLoading" class="module-loading">
      <p>Laden...</p>
    </div>
    <div t-elif="state.error" class="module-error">
      <p class="error-message"><t t-esc="state.error.message || 'Ein Fehler ist aufgetreten'"/></p>
      <button t-on-click="retryLoading" class="btn btn-secondary">Neu laden</button>
    </div>
    <div t-else class="module-content-inner">
      <slot name="default"/>
    </div>
  </div>
  
  <div class="owl-module-footer" t-if="moduleInfo.showFooter">
    <div class="module-status" t-if="moduleInfo.showStatus">
      <slot name="status">
        <span t-if="state.isReady" class="status-ready">Bereit</span>
      </slot>
    </div>
    <div class="module-actions" t-if="moduleInfo.showActions">
      <slot name="actions">
        <button t-if="moduleInfo.showSaveButton" 
                t-on-click="() => this.triggerAction('save')" 
                class="btn btn-primary">
          Speichern
        </button>
      </slot>
    </div>
  </div>
</div>
`;

/**
 * Layout für Listen-Module
 * Optimiert für die Anzeige von Datenlisten
 */
export const LIST_MODULE_LAYOUT = xml`
<div class="owl-module owl-list-module" t-att-class="props.className" t-att-data-module-id="props.moduleId">
  <div class="owl-module-header">
    <div class="module-header-main">
      <h3 t-if="moduleInfo.title"><t t-esc="moduleInfo.title"/></h3>
      <div class="module-actions" t-if="moduleInfo.showHeaderActions">
        <slot name="headerActions"/>
      </div>
    </div>
    <div class="module-toolbar" t-if="moduleInfo.showToolbar">
      <div class="search-container" t-if="moduleInfo.showSearch">
        <slot name="search">
          <input type="text" 
                 placeholder="Suchen..." 
                 t-on-input="onSearchInput" 
                 t-att-value="state.searchTerm || ''" 
                 class="search-input" />
        </slot>
      </div>
      <div class="filter-container" t-if="moduleInfo.showFilter">
        <slot name="filter"/>
      </div>
      <div class="toolbar-actions">
        <slot name="toolbarActions">
          <button t-if="moduleInfo.showNewButton" 
                  t-on-click="() => this.triggerAction('new')" 
                  class="btn btn-primary">
            Neu
          </button>
        </slot>
      </div>
    </div>
  </div>
  
  <div class="owl-module-content">
    <div t-if="state.isLoading" class="module-loading">
      <p>Daten werden geladen...</p>
    </div>
    <div t-elif="state.error" class="module-error">
      <p class="error-message"><t t-esc="state.error.message || 'Ein Fehler ist aufgetreten'"/></p>
      <button t-on-click="retryLoading" class="btn btn-secondary">Neu laden</button>
    </div>
    <div t-elif="isEmptyList" class="module-empty">
      <slot name="empty">
        <p>Keine Daten vorhanden</p>
      </slot>
    </div>
    <div t-else class="module-list-container">
      <slot name="list"/>
    </div>
  </div>
  
  <div class="owl-module-footer" t-if="moduleInfo.showFooter">
    <div class="module-pagination" t-if="moduleInfo.showPagination">
      <slot name="pagination"/>
    </div>
    <div class="module-status" t-if="moduleInfo.showStatus">
      <slot name="status">
        <span t-if="state.totalItems" class="items-count">
          <t t-esc="state.totalItems"/> Einträge
        </span>
      </slot>
    </div>
  </div>
</div>
`;

/**
 * Layout für Formular-Module
 * Optimiert für die Bearbeitung von Datensätzen
 */
export const FORM_MODULE_LAYOUT = xml`
<div class="owl-module owl-form-module" t-att-class="props.className" t-att-data-module-id="props.moduleId">
  <div class="owl-module-header">
    <div class="module-header-main">
      <h3 t-if="moduleInfo.title"><t t-esc="moduleInfo.title"/></h3>
      <div class="module-actions" t-if="moduleInfo.showHeaderActions">
        <slot name="headerActions"/>
      </div>
    </div>
    <div class="form-status" t-if="moduleInfo.showFormStatus">
      <slot name="formStatus">
        <span t-if="state.isDirty" class="status-modified">Ungespeicherte Änderungen</span>
        <span t-elif="state.isSaving" class="status-saving">Wird gespeichert...</span>
        <span t-elif="state.lastSaved" class="status-saved">
          Gespeichert: <t t-esc="formatLastSaved(state.lastSaved)"/>
        </span>
      </slot>
    </div>
  </div>
  
  <div class="owl-module-content">
    <div t-if="state.isLoading" class="module-loading">
      <p>Formular wird geladen...</p>
    </div>
    <div t-elif="state.error" class="module-error">
      <p class="error-message"><t t-esc="state.error.message || 'Ein Fehler ist aufgetreten'"/></p>
      <button t-on-click="retryLoading" class="btn btn-secondary">Neu laden</button>
    </div>
    <div t-elif="state.validationErrors.length" class="validation-errors">
      <h4>Bitte korrigieren Sie folgende Fehler:</h4>
      <ul>
        <t t-foreach="state.validationErrors" t-as="error" t-key="error_index">
          <li><t t-esc="error"/></li>
        </t>
      </ul>
    </div>
    <div t-else class="module-form-container">
      <slot name="form"/>
    </div>
  </div>
  
  <div class="owl-module-footer" t-if="moduleInfo.showFooter">
    <div class="form-nav" t-if="moduleInfo.showFormNav">
      <slot name="formNav"/>
    </div>
    <div class="module-actions">
      <slot name="actions">
        <button t-if="moduleInfo.showCancelButton" 
                t-on-click="() => this.triggerAction('cancel')" 
                class="btn btn-secondary">
          Abbrechen
        </button>
        <button t-if="moduleInfo.showSaveButton" 
                t-on-click="() => this.triggerAction('save')" 
                t-att-disabled="!state.isDirty || state.isSaving"
                class="btn btn-primary">
          Speichern
        </button>
      </slot>
    </div>
  </div>
</div>
`;

/**
 * Layout für Dashboard-Module
 * Optimiert für die Anzeige von Übersichtsdaten
 */
export const DASHBOARD_MODULE_LAYOUT = xml`
<div class="owl-module owl-dashboard-module" t-att-class="props.className" t-att-data-module-id="props.moduleId">
  <div class="owl-module-header">
    <h3 t-if="moduleInfo.title"><t t-esc="moduleInfo.title"/></h3>
    <div class="dashboard-period" t-if="moduleInfo.showPeriodSelector">
      <slot name="periodSelector"/>
    </div>
    <div class="module-actions" t-if="moduleInfo.showHeaderActions">
      <slot name="headerActions"/>
    </div>
  </div>
  
  <div class="owl-module-content">
    <div t-if="state.isLoading" class="module-loading">
      <p>Dashboard wird geladen...</p>
    </div>
    <div t-elif="state.error" class="module-error">
      <p class="error-message"><t t-esc="state.error.message || 'Ein Fehler ist aufgetreten'"/></p>
      <button t-on-click="retryLoading" class="btn btn-secondary">Neu laden</button>
    </div>
    <div t-else class="dashboard-container">
      <slot name="dashboard"/>
    </div>
  </div>
  
  <div class="owl-module-footer" t-if="moduleInfo.showFooter">
    <div class="dashboard-info" t-if="moduleInfo.showDashboardInfo">
      <slot name="dashboardInfo">
        <span t-if="state.lastUpdated" class="last-updated">
          Zuletzt aktualisiert: <t t-esc="formatLastUpdated(state.lastUpdated)"/>
        </span>
      </slot>
    </div>
    <div class="module-actions">
      <slot name="actions">
        <button t-if="moduleInfo.showRefreshButton" 
                t-on-click="() => this.triggerAction('refresh')" 
                t-att-disabled="state.isLoading"
                class="btn btn-secondary">
          Aktualisieren
        </button>
      </slot>
    </div>
  </div>
</div>
`;

export default {
  MODULE_LAYOUT,
  LIST_MODULE_LAYOUT,
  FORM_MODULE_LAYOUT,
  DASHBOARD_MODULE_LAYOUT
};

