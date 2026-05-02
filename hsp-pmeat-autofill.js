// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill (Pro UI + Reset + Toast)
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      3.8
// @description  Premium UI with Default Reset, Mouse Wheel, and Toast Notifications
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
   'use strict';

   // --- Constants & Defaults ---
   const DEFAULTS = {
      autoFillEnabled: true,
      tabWaitDelay: 6000,
      fieldDelay: 400
   };

   // --- Utility Functions ---
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
         '८': 8,
         '৯': 9
      };
      return String(str).replace(/[০-৯]/g, s => banglaNums[s]);
   }

   // --- Settings Loader ---
   let settings = JSON.parse(localStorage.getItem('hsp_settings')) || {
      ...DEFAULTS
   };

   function saveSettings() {
      localStorage.setItem('hsp_settings', JSON.stringify(settings));
   }

   const tabConfigs = {
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
   };

   let completedTabs = {
      "1": false,
      "2": false,
      "3": false
   };
   let isProcessing = false;
   let stopRequested = false;

   // --- UI Construction ---
   const container = document.createElement('div');
   container.id = "hsp-pro-container";
   container.style.cssText = `position: fixed; bottom: 25px; right: 25px; z-index: 10000; display: flex; align-items: center; gap: 12px; font-family: 'Segoe UI', Arial, sans-serif;`;
   document.body.appendChild(container);

   // Notification Toast
   const toast = document.createElement('div');
   toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #52c41a; color: white;
        padding: 12px 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: none; z-index: 10001; font-weight: 500; animation: fadeInDown 0.4s ease;
   `;
   document.body.appendChild(toast);

   function showToast(msg) {
      toast.innerHTML = `✅ ${msg}`;
      toast.style.display = 'block';
      setTimeout(() => {
         toast.style.display = 'none';
      }, 2500);
   }

   // Main Button
   const floatBtn = document.createElement('div');
   floatBtn.style.cssText = `
        background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%); color: white; padding: 12px 24px;
        border-radius: 12px; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        font-weight: 600; user-select: none; transition: 0.3s; text-align: center; min-width: 140px;
    `;
   floatBtn.innerHTML = '🚀 Start Filling';
   container.appendChild(floatBtn);

   // Settings Icon
   const settingsBtn = document.createElement('div');
   settingsBtn.innerHTML = '⚙️';
   settingsBtn.style.cssText = `
        background: #fff; border: 1px solid #d9d9d9; width: 46px; height: 46px;
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 22px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); transition: 0.3s;
    `;
   container.appendChild(settingsBtn);

   // Settings Panel
   const settingsPanel = document.createElement('div');
   settingsPanel.style.cssText = `
        position: absolute; bottom: 70px; right: 0; background: #fff;
        padding: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: none; flex-direction: column; gap: 14px; width: 280px;
        border: 1px solid #f0f0f0; animation: slideUp 0.3s ease;
    `;

   settingsPanel.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; color: #1f1f1f; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 5px;">Settings</div>
        
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px;">
            <input type="checkbox" id="autoFillToggle" ${settings.autoFillEnabled ? 'checked' : ''} style="width: 17px; height: 17px;"> 
            Auto Start on Tab Change
        </label>

        <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; color: #666;">Tab Wait Delay (ms)</span>
                <span class="default-link" id="def-tab">Default</span>
            </div>
            <input type="text" id="tabWaitDelay" value="${settings.tabWaitDelay}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #d9d9d9; font-family: Arial !important; outline: none;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; color: #666;">Field Fill Delay (ms)</span>
                <span class="default-link" id="def-field">Default</span>
            </div>
            <input type="text" id="fieldDelay" value="${settings.fieldDelay}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #d9d9d9; font-family: Arial !important; outline: none;">
        </div>

        <button id="saveSettingsBtn" style="background: #1890ff; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 5px; transition: 0.3s;">Save & Close</button>
   `;
   container.appendChild(settingsPanel);

   // Style Injection
   const style = document.createElement('style');
   style.innerHTML = `
      @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      .default-link { font-size: 11px; color: #1890ff; cursor: pointer; font-weight: bold; text-decoration: underline; }
      .default-link:hover { color: #40a9ff; }
      #saveSettingsBtn:hover { background: #40a9ff !important; box-shadow: 0 4px 10px rgba(24,144,255,0.3); }
      #tabWaitDelay:focus, #fieldDelay:focus { border-color: #1890ff !important; }
   `;
   document.head.appendChild(style);

   // --- Event Handling ---

   settingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
   settingsBtn.onclick = (e) => {
      e.stopPropagation();
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
   };

   // Default Buttons Logic
   document.getElementById('def-tab').onclick = () => {
      document.getElementById('tabWaitDelay').value = DEFAULTS.tabWaitDelay;
   };
   document.getElementById('def-field').onclick = () => {
      document.getElementById('fieldDelay').value = DEFAULTS.fieldDelay;
   };

   // Mouse Wheel Logic
   function setupWheel(id, step) {
      const el = document.getElementById(id);
      el.addEventListener('wheel', (e) => {
         e.preventDefault();
         let val = parseInt(convertToEn(el.value)) || 0;
         val = (e.deltaY < 0) ? val + step : val - step;
         el.value = Math.max(0, val);
      });
   }
   setupWheel('tabWaitDelay', 500);
   setupWheel('fieldDelay', 50);

   // Save Button Logic
   document.getElementById('saveSettingsBtn').onclick = () => {
      settings.autoFillEnabled = document.getElementById('autoFillToggle').checked;
      settings.tabWaitDelay = parseInt(convertToEn(document.getElementById('tabWaitDelay').value)) || DEFAULTS.tabWaitDelay;
      settings.fieldDelay = parseInt(convertToEn(document.getElementById('fieldDelay').value)) || DEFAULTS.fieldDelay;

      saveSettings();
      settingsPanel.style.display = 'none';
      showToast("Settings Saved Successfully!");
   };

   // --- Main Auto Fill Logic ---

   function updateBtnUI(state) {
      if (state === 'running') {
         floatBtn.style.background = 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)';
         floatBtn.innerHTML = '🛑 Stop Filling';
      } else if (state === 'success') {
         floatBtn.style.background = '#52c41a';
         floatBtn.innerHTML = '✅ Finished';
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
         else alert("Active Tab Not Found!");
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
      isProcessing = true;
      stopRequested = false;
      updateBtnUI('running');
      for (const [inputId, index] of Object.entries(config)) {
         if (stopRequested) break;
         await fillAntdRapid(inputId, index);
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
      if (!stopRequested) showToast(`Tab ${tabId} Filled!`);
      stopRequested = false;
   }

   setInterval(() => {
      if (isProcessing || !settings.autoFillEnabled) return;
      const active = document.querySelector('.ant-tabs-tab-active');
      if (!active) return;
      const currentTabKey = active.getAttribute('data-node-key');
      if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
         completedTabs[currentTabKey] = true;
         setTimeout(() => {
            if (!isProcessing && settings.autoFillEnabled) processAutoFill(currentTabKey);
         }, settings.tabWaitDelay);
      }
   }, 1000);
})();
