// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill (With Import/Export)
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      5.0
// @description  Compact UI with % Progress, Default Reset, Toast, and Import/Export Settings
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Default Constants ---
    const DEFAULTS = {
        settings: {
            autoFillEnabled: true,
            tabWaitDelay: 6000,
            fieldDelay: 400
        },
        tabConfigs: {
            "1": {
                'birthPlaceId': 5,
                'religion': 0,
                'currentEduClass': 2,
                'currentEducationDiscipline': 0,
                'currentInstituteAdmissionSession': 0
            },
            "2": {
                'personPermanentDivisionId': 5,
                'personPermanentDistrictId': 0,
                'personPermanentUpazilaId': 3
            },
            "3": {
                'parentsAliveStatus': 0,
                'fatherEducationLevel': 0,
                'motherEducationLevel': 0,
                'studyingSiblingCount': 1,
                'receivingAnotherScholarship': 1,
                'personHasDisabilityCard': 1,
                'personSufferingLongIllness': 1,
                'guardianHasDisabilityCard': 1,
                'guardianSufferingLongIllness': 1,
                'familyMemberHasPhysicalOrMentalDisease': 1,
                'guardianIncomeSource': 3,
                'familyMemberInAbroad': 1,
                'guardianJobRegion': 1,
                'familyYearlyIncome': 0,
                'familyMemberWithJobCount': 0,
                'familyMemberCount': 1,
                'ethnicMinorityGroupId': 0,
                'houseRoomExtent': 1,
                'houseMaterialType': 3,
                'toiletType': 2,
                'electricEquipmentType': 3,
                'waterSource': 2,
                'familyYearlyExpense': 0,
                'ownedLandExtent': 1,
                'guardianHasLoan': 1,
                'personFromFreedomFighterGeneration': 1
            }
        }
    };

    // --- Load Data ---
    let settings = JSON.parse(localStorage.getItem('hsp_settings')) || {
        ...DEFAULTS.settings
    };
    let tabConfigs = JSON.parse(localStorage.getItem('hsp_tab_configs')) || {
        ...DEFAULTS.tabConfigs
    };

    const saveData = () => {
        localStorage.setItem('hsp_settings', JSON.stringify(settings));
        localStorage.setItem('hsp_tab_configs', JSON.stringify(tabConfigs));
    };

    function convertToEn(str) {
        const banglaNums = {
            '০': 0,
            '১': 1,
            '২': 2,
            '৩': 3,
            '৪': 4,
            '৫': 5,
            '৬': 6,
            '৭': 7,
            '৮': 8,
            '৯': 9
        };
        return String(str).replace(/[০-৯]/g, s => banglaNums[s]);
    }

    let completedTabs = {
        "1": false,
        "2": false,
        "3": false
    };
    let isProcessing = false;
    let stopRequested = false;

    // --- UI Construction ---
    const commonHeight = "34px";
    const borderRadius = "8px";

    const container = document.createElement('div');
    container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; align-items: center; gap: 8px; font-family: 'Segoe UI', Arial, sans-serif;`;
    document.body.appendChild(container);

    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; top: 15px; right: 15px; background: #52c41a; color: white; padding: 10px 20px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; z-index: 10001; font-weight: 500; font-size: 13px; animation: fadeInDown 0.4s ease;`;
    document.body.appendChild(toast);

    function showToast(msg, type = "success") {
        toast.style.background = type === "success" ? "#52c41a" : "#ff4d4f";
        toast.innerHTML = (type === "success" ? "✅ " : "❌ ") + msg;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2500);
    }

    const floatBtn = document.createElement('div');
    floatBtn.style.cssText = `background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%); color: white; height: ${commonHeight}; padding: 0 16px; box-sizing: border-box; border-radius: ${borderRadius}; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-weight: 600; font-size: 13px; user-select: none; transition: 0.3s; display: flex; align-items: center; justify-content: center; min-width: 130px;`;
    floatBtn.innerHTML = '🚀 Start Filling';
    container.appendChild(floatBtn);

    const settingsBtn = document.createElement('div');
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.style.cssText = `background: #fff; border: 1px solid #d9d9d9; width: ${commonHeight}; height: ${commonHeight}; box-sizing: border-box; border-radius: ${borderRadius}; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: 0.3s;`;
    container.appendChild(settingsBtn);

    // --- Settings Panel ---
    const settingsPanel = document.createElement('div');
    settingsPanel.style.cssText = `position: absolute; bottom: 50px; right: 0; background: #fff; padding: 15px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; flex-direction: column; gap: 12px; width: 260px; border: 1px solid #f0f0f0; animation: slideUp 0.3s ease;`;
    settingsPanel.innerHTML = `
        <div style="font-weight: bold; font-size: 14px; color: #1f1f1f; border-bottom: 1px solid #eee; padding-bottom: 8px;">Settings</div>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;"><input type="checkbox" id="autoFillToggle" ${settings.autoFillEnabled ? 'checked' : ''}> Auto Start</label>
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;"><span style="font-size: 12px; color: #666;">Tab Delay (ms)</span><span class="default-link" id="def-tab">Default</span></div>
            <input type="text" id="tabWaitDelay" value="${settings.tabWaitDelay}" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-family: Arial !important; font-size: 12px;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;"><span style="font-size: 12px; color: #666;">Field Delay (ms)</span><span class="default-link" id="def-field">Default</span></div>
            <input type="text" id="fieldDelay" value="${settings.fieldDelay}" style="width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-family: Arial !important; font-size: 12px;">
        </div>

        <div style="display: flex; gap: 8px; margin-top: 5px;">
            <button id="exportBtn" style="flex:1; background:#f0f0f0; border:1px solid #d9d9d9; padding:6px; border-radius:4px; font-size:11px; cursor:pointer;">📤 Export</button>
            <button id="importBtn" style="flex:1; background:#f0f0f0; border:1px solid #d9d9d9; padding:6px; border-radius:4px; font-size:11px; cursor:pointer;">📥 Import</button>
            <input type="file" id="importFile" style="display:none;" accept=".json">
        </div>

        <button id="saveSettingsBtn" style="background: #1890ff; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">Save & Close</button>
   `;
    container.appendChild(settingsPanel);

    const style = document.createElement('style');
    style.innerHTML = `@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeInDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } } .default-link { font-size: 10px; color: #1890ff; cursor: pointer; font-weight: bold; text-decoration: underline; }`;
    document.head.appendChild(style);

    // --- Export/Import Logic ---

    document.getElementById('exportBtn').onclick = () => {
        const dataStr = JSON.stringify({
            settings,
            tabConfigs
        }, null, 2);
        const blob = new Blob([dataStr], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hsp_config_${new Date().toLocaleDateString()}.json`;
        link.click();
        showToast("Config Exported!");
    };

    document.getElementById('importBtn').onclick = () => document.getElementById('importFile').click();

    document.getElementById('importFile').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.settings && imported.tabConfigs) {
                    settings = imported.settings;
                    tabConfigs = imported.tabConfigs;
                    saveData();
                    showToast("Imported! Reloading...");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    throw new Error("Invalid Format");
                }
            } catch (err) {
                showToast("Invalid File!", "error");
            }
        };
        reader.readAsText(file);
    };

    // --- Standard Handling ---
    settingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
    settingsBtn.onclick = (e) => {
        e.stopPropagation();
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
    };
    document.getElementById('def-tab').onclick = () => {
        document.getElementById('tabWaitDelay').value = DEFAULTS.settings.tabWaitDelay;
    };
    document.getElementById('def-field').onclick = () => {
        document.getElementById('fieldDelay').value = DEFAULTS.settings.fieldDelay;
    };

    function setupWheel(id, step) {
        const el = document.getElementById(id);
        el.addEventListener('wheel', (e) => {
            e.preventDefault();
            let val = parseInt(convertToEn(el.value)) || 0;
            el.value = Math.max(0, (e.deltaY < 0 ? val + step : val - step));
        });
    }
    setupWheel('tabWaitDelay', 500);
    setupWheel('fieldDelay', 50);

    document.getElementById('saveSettingsBtn').onclick = () => {
        settings.autoFillEnabled = document.getElementById('autoFillToggle').checked;
        settings.tabWaitDelay = parseInt(convertToEn(document.getElementById('tabWaitDelay').value)) || DEFAULTS.settings.tabWaitDelay;
        settings.fieldDelay = parseInt(convertToEn(document.getElementById('fieldDelay').value)) || DEFAULTS.settings.fieldDelay;
        saveData();
        settingsPanel.style.display = 'none';
        showToast("Saved!");
    };

    // --- Fill Logic ---
    function updateBtnUI(state, percent = 0) {
        if (state === 'running') {
            floatBtn.style.background = 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)';
            floatBtn.innerHTML = `🛑 Stop (${percent}%)`;
        } else if (state === 'success') {
            floatBtn.style.background = '#52c41a';
            floatBtn.innerHTML = '✅ Done';
            setTimeout(() => updateBtnUI('idle'), 2000);
        } else if (state === 'stopped') {
            floatBtn.style.background = '#faad14';
            floatBtn.innerHTML = '⚠️ Stopped';
            setTimeout(() => updateBtnUI('idle'), 2000);
        } else {
            floatBtn.style.background = 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)';
            floatBtn.innerHTML = '🚀 Start Filling';
        }
    }

    floatBtn.onclick = () => {
        if (isProcessing) stopRequested = true;
        else {
            const active = document.querySelector('.ant-tabs-tab-active');
            if (active) processAutoFill(active.getAttribute('data-node-key'));
        }
    };

    async function fillAntdRapid(inputId, optionIndex) {
        if (stopRequested) return;
        return new Promise((resolve) => {
            const input = document.getElementById(inputId);
            if (!input) return resolve();
            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();
            ['mousedown', 'mouseup', 'click'].forEach(evt => selector.dispatchEvent(new MouseEvent(evt, {
                bubbles: true,
                cancelable: true,
                view: window
            })));
            let found = false,
                attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (stopRequested) {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }
                const activeDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
                if (activeDropdown) {
                    const options = activeDropdown.querySelectorAll('.ant-select-item-option');
                    if (options.length > optionIndex) {
                        const targetOption = options[optionIndex];
                        ['mousedown', 'mouseup', 'click'].forEach(evt => targetOption.dispatchEvent(new MouseEvent(evt, {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        })));
                        found = true;
                    }
                }
                if (found || attempts > 20) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    async function processAutoFill(tabId) {
        const config = tabConfigs[tabId];
        if (!config) return;
        const entries = Object.entries(config);
        const totalFields = entries.length;
        let completedCount = 0;
        isProcessing = true;
        stopRequested = false;
        updateBtnUI('running', 0);
        for (const [inputId, index] of entries) {
            if (stopRequested) break;
            await fillAntdRapid(inputId, index);
            completedCount++;
            updateBtnUI('running', Math.round((completedCount / totalFields) * 100));
            await new Promise(r => setTimeout(r, settings.fieldDelay));
        }
        if (tabId === "2" && !stopRequested) {
            const checkbox = document.getElementById('sameAsPermanent');
            if (checkbox && !checkbox.checked) {
                checkbox.click();
                checkbox.dispatchEvent(new Event('change', {
                    bubbles: true
                }));
            }
        }
        isProcessing = false;
        updateBtnUI(stopRequested ? 'stopped' : 'success');
        stopRequested = false;
    }

    setInterval(() => {
        if (isProcessing || !settings.autoFillEnabled) return;
        const active = document.querySelector('.ant-tabs-tab-active');
        if (!active) return;
        const key = active.getAttribute('data-node-key');
        if (tabConfigs[key] && !completedTabs[key]) {
            completedTabs[key] = true;
            setTimeout(() => {
                if (!isProcessing && settings.autoFillEnabled) processAutoFill(key);
            }, settings.tabWaitDelay);
        }
    }, 1000);
})();
