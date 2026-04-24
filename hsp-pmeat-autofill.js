// ==UserScript==
// @name         HSP PMEAT Form Rapid Fill
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Super fast sequential fill for Ant Design dropdowns
// @author       Md. Rasel Rahman Rocky
// @match        https://hsp.pmeat.gov.bd/applicant/applicantForm
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ==========================================================================
    // ইনপুট আইডি এবং অপশন ইনডেক্স (০ = ১ম অপশন, ১ = ২য় অপশন...)
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

    async function fillAntdRapid(inputId, optionIndex) {
        return new Promise((resolve) => {
            const input = document.getElementById(inputId);
            if (!input) return resolve();

            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();

            // ড্রপডাউন ওপেন করা
            const triggerEvents = ['mousedown', 'mouseup', 'click'];
            triggerEvents.forEach(evtType => {
                selector.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
            });

            let found = false;
            let attempts = 0;

            // অপশন খোঁজার ইন্টারভাল অনেক কমিয়ে দেওয়া হয়েছে (৫০ মিলি-সেকেন্ড)
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
            }, 80); // খুব দ্রুত চেক করবে
        });
    }

    async function startAutoFill() {
        console.log("🚀 Rapid Auto-Fill শুরু হচ্ছে...");

        for (const [inputId, index] of Object.entries(fieldConfig)) {
            await fillAntdRapid(inputId, index);
            // ফিল্ডগুলোর মাঝের গ্যাপ কমিয়ে ৪০০ মিলি-সেকেন্ড করা হয়েছে
            await new Promise(r => setTimeout(r, 400));
        }

        console.log("🏁 সব কাজ দ্রুত সম্পন্ন হয়েছে!");
    }

    // পেজ লোড হওয়ার সাথে সাথেই শুরু করার জন্য সময় কমিয়ে দেওয়া হয়েছে
    if (document.readyState === 'complete') {
        setTimeout(startAutoFill, 1000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(startAutoFill, 1000);
        });
    }
})();
