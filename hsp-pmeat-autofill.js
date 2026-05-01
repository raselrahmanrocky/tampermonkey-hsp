// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      2.1
// @description  Tab-wise sequential fill for Ant Design dropdowns with delay and checkbox support
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

    let completedTabs = { "1": false, "2": false, "3": false };
    const globalWaitDelay = 6000;

    async function fillAntdRapid(inputId, optionIndex) {
        return new Promise((resolve) => {
            const input = document.getElementById(inputId);
            if (!input) return resolve();

            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();

            const triggerEvents = ['mousedown', 'mouseup', 'click'];
            triggerEvents.forEach(evt => selector.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })));

            let found = false;
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;
                const activeDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');

                if (activeDropdown) {
                    const options = activeDropdown.querySelectorAll('.ant-select-item-option');
                    if (options.length > optionIndex) {
                        const targetOption = options[optionIndex];
                        ['mousedown', 'mouseup', 'click'].forEach(evt => targetOption.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })));
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
        if (!config || Object.keys(config).length === 0) return;

        console.log(`🚀 ট্যাব ${tabId}-এর জন্য অটো-ফিল শুরু হচ্ছে...`);

        // ড্রপডাউনগুলো ফিল করা
        for (const [inputId, index] of Object.entries(config)) {
            await fillAntdRapid(inputId, index);
            await new Promise(r => setTimeout(r, 400));
        }

        // --- নতুন অংশ: ট্যাব ২-এ চেকবক্স সিলেক্ট করা ---
        if (tabId === "2") {
            const checkbox = document.getElementById('sameAsPermanent');
            if (checkbox && !checkbox.checked) {
                console.log("✅ 'একই স্থায়ী ঠিকানার সাথে' চেকবক্সটি সিলেক্ট করা হচ্ছে...");
                checkbox.click(); // চেকবক্সে ক্লিক করা হচ্ছে
                // Ant Design-এর ক্ষেত্রে মাঝে মাঝে সরাসরি ইভেন্ট ট্রিগার করতে হয়
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        // ------------------------------------------

        console.log(`🏁 ট্যাব ${tabId}-এর কাজ শেষ!`);
    }

    function monitorTabs() {
        const activeTabElement = document.querySelector('.ant-tabs-tab-active');
        if (!activeTabElement) return;

        const currentTabKey = activeTabElement.getAttribute('data-node-key');

        if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
            completedTabs[currentTabKey] = true;
            console.log(`✅ ট্যাব ${currentTabKey} শনাক্ত হয়েছে। ${globalWaitDelay/1000} সেকেন্ড অপেক্ষা করুন...`);

            setTimeout(() => {
                processAutoFill(currentTabKey);
            }, globalWaitDelay);
        }
    }

    setInterval(monitorTabs, 1000);

})();
