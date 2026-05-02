// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill (With Settings - Fixed English Num)
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      3.1
// @description  Fill Ant Design forms with a floating Start/Stop toggle button and Settings menu (English Numbers Fixed)
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
   'use strict';

   // বাংলা সংখ্যাকে ইংরেজিতে রূপান্তর করার ফাংশন
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
      return String(str).replace(/[০-৯]/g, function (w) {
         return banglaNums[w];
      });
   }

   // --- Default Settings ---
   let settings = JSON.parse(localStorage.getItem('hsp_settings')) || {
      autoFillEnabled: true,
      tabWaitDelay: 6000,
      fieldDelay: 400
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
   container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; align-items: center; gap: 10px;`;
   document.body.appendChild(container);

   const floatBtn = document.createElement('div');
   floatBtn.style.cssText = `
        background: #1890ff; color: white; padding: 12px 20px;
        border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-weight: bold; font-family: sans-serif; user-select: none; transition: 0.3s;
        text-align: center; min-width: 120px;
    `;
   floatBtn.innerHTML = '🚀 Start Filling';
   container.appendChild(floatBtn);

   const settingsBtn = document.createElement('div');
   settingsBtn.innerHTML = '⚙️';
   settingsBtn.style.cssText = `
        background: #fff; border: 1px solid #ddd; width: 40px; height: 40px;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    `;
   container.appendChild(settingsBtn);

   const settingsPanel = document.createElement('div');
   settingsPanel.style.cssText = `
        position: absolute; bottom: 60px; right: 0; background: white;
        padding: 15px; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: none; flex-direction: column; gap: 10px; width: 230px;
        font-family: Arial, sans-serif !important; font-size: 14px; border: 1px solid #eee;
    `;

   // ইনপুট বক্সে font-family: Arial !important দেওয়া হয়েছে যাতে ইংরেজি ফন্ট ফোর্স করা হয়
   settingsPanel.innerHTML = `
        <strong style="display:block; margin-bottom:5px;">Settings</strong>
        <label><input type="checkbox" id="autoFillToggle" ${settings.autoFillEnabled ? 'checked' : ''}> Auto Start on Tab Change</label>
        <label>Tab Wait Delay (ms): <input type="text" id="tabWaitDelay" value="${settings.tabWaitDelay}" style="width:70px; font-family: Arial !important;"></label>
        <label>Field Fill Delay (ms): <input type="text" id="fieldDelay" value="${settings.fieldDelay}" style="width:70px; font-family: Arial !important;"></label>
        <button id="saveSettingsBtn" style="background:#1890ff; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold;">Save & Close</button>
   `;
   container.appendChild(settingsPanel);

   // --- Event Listeners ---
   settingsBtn.onclick = () => {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
   };

   document.getElementById('saveSettingsBtn').onclick = () => {
      const tabDelayRaw = document.getElementById('tabWaitDelay').value;
      const fieldDelayRaw = document.getElementById('fieldDelay').value;

      settings.autoFillEnabled = document.getElementById('autoFillToggle').checked;
      // সেভ করার আগে বাংলাকে ইংরেজিতে কনভার্ট করা হচ্ছে
      settings.tabWaitDelay = parseInt(convertToEn(tabDelayRaw)) || 6000;
      settings.fieldDelay = parseInt(convertToEn(fieldDelayRaw)) || 400;

      saveSettings();
      settingsPanel.style.display = 'none';
      alert("Settings Saved successfully in English numerals!");
   };

   // --- বাটন আপডেট এবং কোর লজিক আগের মতই ---
   function updateBtnUI(state) {
      if (state === 'running') {
         floatBtn.style.background = '#ff4d4f';
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
         floatBtn.style.background = '#1890ff';
         floatBtn.innerHTML = '🚀 Start Filling';
      }
   }

   floatBtn.onclick = () => {
      if (isProcessing) {
         stopRequested = true;
      } else {
         const activeTabElement = document.querySelector('.ant-tabs-tab-active');
         if (activeTabElement) {
            const currentTabKey = activeTabElement.getAttribute('data-node-key');
            processAutoFill(currentTabKey);
         } else {
            alert("Active Tab Not Found!");
         }
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
         let found = false;
         let attempts = 0;
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
      if (stopRequested) updateBtnUI('stopped');
      else updateBtnUI('success');
      stopRequested = false;
   }

   function monitorTabs() {
      if (isProcessing || !settings.autoFillEnabled) return;
      const activeTabElement = document.querySelector('.ant-tabs-tab-active');
      if (!activeTabElement) return;
      const currentTabKey = activeTabElement.getAttribute('data-node-key');
      if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
         completedTabs[currentTabKey] = true;
         setTimeout(() => {
            if (!isProcessing && settings.autoFillEnabled) processAutoFill(currentTabKey);
         }, settings.tabWaitDelay);
      }
   }

   setInterval(monitorTabs, 1000);
})();
