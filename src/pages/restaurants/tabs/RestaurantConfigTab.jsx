// RestaurantConfigTab.jsx -- C.4 Restaurant Configuration.

import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '../../../api/restaurants.api';
import { StatefulContent } from '../../../components/StateViews';

export function RestaurantConfigTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await restaurantsApi.getConfig(restaurantId);
      setState({ data, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  function updateField(path, value) {
    setState((s) => {
      const data = structuredClone(s.data);
      const keys = path.split('.');
      let obj = data;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return { ...s, data };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    try {
      const { businessType, defaultTax, billSettings, printerConfig } = state.data;
      const updated = await restaurantsApi.updateConfig(restaurantId, { businessType, defaultTax, billSettings, printerConfig });
      setState((s) => ({ ...s, data: updated }));
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
      {(config) => (
        <div className="form-grid">
          <label className="field"><span className="field__label">Business Type</span>
            <select className="field__input" value={config.businessType} onChange={(e) => updateField('businessType', e.target.value)}>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="cloud_kitchen">Cloud Kitchen</option>
              <option value="bar">Bar</option>
            </select></label>

          <label className="field"><span className="field__label">Default Tax Label</span>
            <input className="field__input" value={config.defaultTax.label} onChange={(e) => updateField('defaultTax.label', e.target.value)} /></label>
          <label className="field"><span className="field__label">Default Tax %</span>
            <input type="number" className="field__input" value={config.defaultTax.percentage} onChange={(e) => updateField('defaultTax.percentage', Number(e.target.value))} /></label>

          <label className="field"><span className="field__label">Invoice Prefix</span>
            <input className="field__input" value={config.billSettings.invoicePrefix} onChange={(e) => updateField('billSettings.invoicePrefix', e.target.value)} /></label>
          <label className="field"><span className="field__label">Printer Paper Width</span>
            <select className="field__input" value={config.printerConfig.paperWidthMm} onChange={(e) => updateField('printerConfig.paperWidthMm', Number(e.target.value))}>
              <option value={58}>58mm</option>
              <option value={80}>80mm</option>
            </select></label>
          <label className="field"><span className="field__label">KOT Copies</span>
            <input type="number" min={1} max={5} className="field__input" value={config.printerConfig.kotCopies} onChange={(e) => updateField('printerConfig.kotCopies', Number(e.target.value))} /></label>

          {saveError && <div className="login-form__error" role="alert">{saveError}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn--primary" disabled={isSaving} onClick={handleSave}>
              {isSaving ? 'Saving…' : 'Save configuration'}
            </button>
          </div>
          <p className="form-hint form-hint--span2">Ye Android app ke first sync mein download hoga.</p>
        </div>
      )}
    </StatefulContent>
  );
}
