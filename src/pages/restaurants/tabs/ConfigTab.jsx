// src/pages/restaurants/tabs/ConfigTab.jsx -- C.4 Restaurant Configuration.

import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '../../../api/restaurants.api';
import { StatefulContent } from '../../../components/StateViews';

export function ConfigTab({ restaurantId }) {
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

  async function handleSave(updates) {
    setSaveError(null);
    setIsSaving(true);
    try {
      const updated = await restaurantsApi.updateConfig(restaurantId, updates);
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
        <div className="config-sections">
          <p className="form-note">
            This configuration is downloaded by the Android POS app on its first sync after a device logs in.
          </p>

          <ConfigSection title="Default Tax">
            <label className="field">
              <span className="field__label">Label</span>
              <input
                className="field__input"
                defaultValue={config.defaultTax.label}
                onBlur={(e) => handleSave({ defaultTax: { ...config.defaultTax, label: e.target.value } })}
              />
            </label>
            <label className="field">
              <span className="field__label">Percentage</span>
              <input
                type="number"
                className="field__input"
                defaultValue={config.defaultTax.percentage}
                onBlur={(e) => handleSave({ defaultTax: { ...config.defaultTax, percentage: Number(e.target.value) } })}
              />
            </label>
          </ConfigSection>

          <ConfigSection title="Bill Settings">
            <label className="field">
              <span className="field__label">Invoice Prefix</span>
              <input
                className="field__input"
                defaultValue={config.billSettings.invoicePrefix}
                onBlur={(e) => handleSave({ billSettings: { ...config.billSettings, invoicePrefix: e.target.value } })}
              />
            </label>
          </ConfigSection>

          <ConfigSection title="Printer Configuration">
            <label className="field">
              <span className="field__label">Paper Width (mm)</span>
              <select
                className="field__input"
                defaultValue={config.printerConfig.paperWidthMm}
                onChange={(e) => handleSave({ printerConfig: { ...config.printerConfig, paperWidthMm: Number(e.target.value) } })}
              >
                <option value={58}>58mm</option>
                <option value={80}>80mm</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">KOT Copies</span>
              <input
                type="number"
                min={1}
                max={5}
                className="field__input"
                defaultValue={config.printerConfig.kotCopies}
                onBlur={(e) => handleSave({ printerConfig: { ...config.printerConfig, kotCopies: Number(e.target.value) } })}
              />
            </label>
          </ConfigSection>

          {isSaving && <p className="cell-secondary">Saving…</p>}
          {saveError && <div className="login-form__error" role="alert">{saveError}</div>}
        </div>
      )}
    </StatefulContent>
  );
}

function ConfigSection({ title, children }) {
  return (
    <div className="panel">
      <h3 className="panel__title">{title}</h3>
      <div className="form-grid">{children}</div>
    </div>
  );
}
