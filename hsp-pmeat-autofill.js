// ==UserScript==
// @name         HSP PMEAT Multi-Tab Auto Fill (With Floating Button)
// @namespace    http://facebook.com/raselrahmanrocky/
// @version      2.2
// @description  Tab-wise sequential fill with a floating manual trigger button
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ট্যাব অনুযায়ী ফিল্ড কনফিগারেশন
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

    // --- Floating Button তৈরি ---
    const floatBtn = document.createElement('div');
    floatBtn.innerHTML = '🚀 Fill Data';
    floatBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1890ff;
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: bold;
        font-family: sans-serif;
        user-select: none;
        transition: 0.3s;
    `;
    floatBtn.onmouseover = () => floatBtn.style.background = '#40a9ff';
    floatBtn.onmouseout = () => floatBtn.style.background = '#1890ff';
    document.body.appendChild(floatBtn);

    // বাটনে ক্লিক করলে যা হবে
    floatBtn.onclick = () => {
        const activeTabElement = document.querySelector('.ant-tabs-tab-active');
        if (activeTabElement) {
            const currentTabKey = activeTabElement.getAttribute('data-node-key');
            processAutoFill(currentTabKey);
        } else {
            alert("কোনো একটিভ ট্যাব পাওয়া যায়নি!");
        }
    };

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
        if (!config) {
            console.log(`ট্যাব ${tabId}-এর জন্য কোনো কনফিগারেশন নেই।`);
            return;
        }

        floatBtn.style.background = '#ff4d4f'; // কাজ চলাকালীন লাল রঙ হবে
        floatBtn.innerText = '⏳ Filling...';

        console.log(`🚀 ট্যাব ${tabId}-এর কাজ শুরু...`);

        // ড্রপডাউনগুলো ফিল করা
        for (const [inputId, index] of Object.entries(config)) {
            await fillAntdRapid(inputId, index);
            await new Promise(r => setTimeout(r, 400));
        }

        // ট্যাব ২-এর চেকবক্স স্পেশাল হ্যান্ডলিং
        if (tabId === "2") {
            const checkbox = document.getElementById('sameAsPermanent');
            if (checkbox && !checkbox.checked) {
                checkbox.click();
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        console.log(`🏁 ট্যাব ${tabId}-এর কাজ শেষ!`);
        floatBtn.style.background = '#52c41a'; // শেষ হলে সবুজ রঙ
        floatBtn.innerText = '✅ Success!';

        setTimeout(() => {
            floatBtn.style.background = '#1890ff';
            floatBtn.innerText = '🚀 Fill Data';
        }, 2000);
    }

    // অটো-মনিটর (ট্যাবে গেলে নিজে থেকেই ফিল হবে, আগের মতো)
    function monitorTabs() {
        const activeTabElement = document.querySelector('.ant-tabs-tab-active');
        if (!activeTabElement) return;

        const currentTabKey = activeTabElement.getAttribute('data-node-key');

        if (tabConfigs[currentTabKey] && !completedTabs[currentTabKey]) {
            completedTabs[currentTabKey] = true;
            console.log(`✅ অটো-ফিল ডিলে শুরু: ${globalWaitDelay/1000}s`);

            setTimeout(() => {
                processAutoFill(currentTabKey);
            }, globalWaitDelay);
        }
    }

    setInterval(monitorTabs, 1000);

})();
