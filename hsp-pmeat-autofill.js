// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      2.0
// @description  Tab-wise sequential fill for Ant Design dropdowns with delay
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ট্যাব অনুযায়ী ফিল্ড কনফিগারেশন
    const tabConfigs = {
        "1": { // ট্যাব ১-এর ফিল্ডসমূহ
            'birthPlaceId': 5,
            'religion': 0,
            'currentEduClass': 2,
            'currentEducationDiscipline': 0,
            'currentInstituteAdmissionSession': 0,
        },
        "2": { // ট্যাব ২-এর জন্য (আপনি চাইলে এখানে আইডি যোগ করতে পারেন)
            // 'exampleFieldId': 0,
        },
        "3": { // ট্যাব ৩-এর ফিল্ডসমূহ (আর্থসামাজিক তথ্য)
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

    // কোন ট্যাব অলরেডি ফিল হয়েছে কি না তা ট্র্যাক করার জন্য
    let completedTabs = { "1": false, "2": false, "3": false };
    const globalWaitDelay = 6000; // ট্যাবে যাওয়ার পর ৬ সেকেন্ড অপেক্ষা করবে

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

        for (const [inputId, index] of Object.entries(config)) {
            await fillAntdRapid(inputId, index);
            await new Promise(r => setTimeout(r, 400)); // প্রতিটি ফিল্ডের মাঝখানের ডিলে
        }

        console.log(`🏁 ট্যাব ${tabId}-এর কাজ শেষ!`);
    }

    function monitorTabs() {
        // বর্তমানে কোন ট্যাবটি একটিভ আছে তা দেখা
        const activeTabElement = document.querySelector('.ant-tabs-tab-active');
        if (!activeTabElement) return;

        const currentTabKey = activeTabElement.getAttribute('data-node-key');

        // যদি ট্যাবটি কনফিগারেশনে থাকে এবং আগে ফিল না করা হয়ে থাকে
        if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
            completedTabs[currentTabKey] = true; // এখনই মার্ক করে দিচ্ছি যেন বার বার টাইমার শুরু না হয়

            console.log(`✅ ট্যাব ${currentTabKey} শনাক্ত হয়েছে। ${globalWaitDelay/1000} সেকেন্ড অপেক্ষা করুন...`);

            setTimeout(() => {
                processAutoFill(currentTabKey);
            }, globalWaitDelay);
        }
    }

    // প্রতি ১ সেকেন্ড পরপর ট্যাবের পরিবর্তন চেক করবে
    setInterval(monitorTabs, 1000);

})();
