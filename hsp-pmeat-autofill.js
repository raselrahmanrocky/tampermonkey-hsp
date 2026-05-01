// ==UserScript==
// @name         HSP PMEAT Form Rapid Fill (Tab 3 with Delay)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Super fast sequential fill for Ant Design dropdowns - Only works on Tab 3 after 6s delay
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ট্যাব ৩ এ যাওয়ার পর কত মিলি-সেকেন্ড অপেক্ষা করবে (৬০০০ মি.সে. = ৬ সেকেন্ড)
    const waitDelay = 6000;

    // ==========================================================================
    // ইনপুট আইডি এবং অপশন ইনডেক্স
    // ==========================================================================
    const fieldConfig = {
        'birthPlaceId': 5,
        'religion': 0,
        'currentEduClass': 2,
        'currentEducationDiscipline': 0,
        'currentInstituteAdmissionSession': 0,

        //Socioeconomic Information. //আর্থসামাজিক তথ্য
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
    };

    let isFilled = false;

    async function fillAntdRapid(inputId, optionIndex) {
        return new Promise((resolve) => {
            const input = document.getElementById(inputId);
            if (!input) return resolve();

            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();

            const triggerEvents = ['mousedown', 'mouseup', 'click'];
            triggerEvents.forEach(evtType => {
                selector.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
            });

            let found = false;
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;
                const activeDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');

                if (activeDropdown) {
                    const options = activeDropdown.querySelectorAll('.ant-select-item-option');
                    if (options.length > optionIndex) {
                        const targetOption = options[optionIndex];
                        const optEvents = ['mousedown', 'mouseup', 'click'];
                        optEvents.forEach(evtType => {
                            targetOption.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
                        });
                        found = true;
                    }
                }

                if (found || attempts > 20) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 80);
        });
    }

    async function startAutoFill() {
        console.log("🚀 ডিলে শেষ! এখন Rapid Auto-Fill শুরু হচ্ছে...");

        for (const [inputId, index] of Object.entries(fieldConfig)) {
            await fillAntdRapid(inputId, index);
            // ড্রপডাউনগুলোর মাঝখানের গ্যাপ ৩৫০ মিলি-সেকেন্ড
            await new Promise(r => setTimeout(r, 350));
        }

        console.log("🏁 ৩ নম্বর ট্যাবের সব কাজ সম্পন্ন হয়েছে!");
    }

    // কন্ডিশন চেক করার ফাংশন
    function checkTabAndRun() {
        if (isFilled) return;

        // চেক করছে সেই ট্যাবটি যার data-node-key="3" এবং সেটি active ক্লাসে আছে
        const tab3 = document.querySelector('.ant-tabs-tab-active[data-node-key="3"]');

        if (tab3) {
            isFilled = true; // যেন বার বার টাইমার সেট না হয়
            console.log(`✅ Tab 3 শনাক্ত হয়েছে। ${waitDelay/1000} সেকেন্ড পর অটো-ফিল শুরু হবে...`);

            // নির্দিষ্ট সময় পর অটো-ফিল ফাংশন কল করা হবে
            setTimeout(startAutoFill, waitDelay);
        }
    }

    // প্রতি ১ সেকেন্ড পরপর চেক করবে আপনি ৩ নম্বর ট্যাবে গিয়েছেন কি না
    setInterval(checkTabAndRun, 1000);

})();
