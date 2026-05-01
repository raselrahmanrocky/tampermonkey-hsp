// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill (With Start/Stop Toggle)
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      2.3
// @description  Fill Ant Design forms with a floating Start/Stop toggle button
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
   'use strict';

   const tabConfigs = {
      "1": {
         'birthPlaceId': 5,
         'religion': 0,
         'currentEduClass': 2,
         'currentEducationDiscipline': 0,
         'currentInstituteAdmissionSession': 0,
      },
      "2": {
         'personPermanentDivisionId': 5,
         'personPermanentDistrictId': 0,
         'personPermanentUpazilaId': 3,
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
         'personFromFreedomFighterGeneration': 1,
      }
   };

   let completedTabs = {
      "1": false,
      "2": false,
      "3": false
   };
   let isProcessing = false; // ফিলিং চলছে কি না তা ট্র্যাক করবে
   let stopRequested = false; // ইউজার স্টপ করতে চাইলে এটি true হবে
   const globalWaitDelay = 6000;

   // --- Floating Button তৈরি ---
   const floatBtn = document.createElement('div');
   floatBtn.innerHTML = '🚀 Start Filling';
   floatBtn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #1890ff; color: white; padding: 12px 25px;
        border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 9999; font-weight: bold; font-family: sans-serif;
        user-select: none; transition: 0.3s; text-align: center; min-width: 120px;
    `;
   document.body.appendChild(floatBtn);

   // বাটনের স্টাইল আপডেট করার ফাংশন
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

   // বাটন ক্লিক ইভেন্ট
   floatBtn.onclick = () => {
      if (isProcessing) {
         stopRequested = true; // স্টপ রিকোয়েস্ট সেট করা
      } else {
         const activeTabElement = document.querySelector('.ant-tabs-tab-active');
         if (activeTabElement) {
            const currentTabKey = activeTabElement.getAttribute('data-node-key');
            processAutoFill(currentTabKey);
         } else {
            alert("একটিভ ট্যাব পাওয়া যায়নি!");
         }
      }
   };

   async function fillAntdRapid(inputId, optionIndex) {
      if (stopRequested) return; // স্টপ বলা হলে সাথে সাথে বের হয়ে যাবে
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

      console.log(`🚀 ট্যাব ${tabId}-এর কাজ শুরু...`);

      for (const [inputId, index] of Object.entries(config)) {
         if (stopRequested) break; // লুপের মাঝে চেক করা হচ্ছে ইউজার স্টপ করেছে কি না
         await fillAntdRapid(inputId, index);
         await new Promise(r => setTimeout(r, 400));
      }

      // ট্যাব ২-এর জন্য চেকবক্স হ্যান্ডলিং
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
      if (stopRequested) {
         console.log("🛑 ইউজার দ্বারা প্রসেস বন্ধ করা হয়েছে।");
         updateBtnUI('stopped');
      } else {
         console.log(`🏁 ট্যাব ${tabId}-এর কাজ সফলভাবে শেষ!`);
         updateBtnUI('success');
      }
      stopRequested = false;
   }

   // অটো-মনিটর ফাংশন
   function monitorTabs() {
      if (isProcessing) return; // যদি অলরেডি কাজ চলে তবে নতুন করে অটো স্টার্ট হবে না

      const activeTabElement = document.querySelector('.ant-tabs-tab-active');
      if (!activeTabElement) return;

      const currentTabKey = activeTabElement.getAttribute('data-node-key');

      if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
         completedTabs[currentTabKey] = true;
         console.log(`⏳ অটো-ফিল শুরু হবে ${globalWaitDelay/1000}s পর...`);

         setTimeout(() => {
            // ৬ সেকেন্ড পর ফিল শুরু করার আগে আবার চেক করা হচ্ছে
            if (!isProcessing) processAutoFill(currentTabKey);
         }, globalWaitDelay);
      }
   }

   setInterval(monitorTabs, 1000);

})();
