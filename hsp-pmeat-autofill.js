// ==UserScript==
// @name         HSP Form Ultimate Fix
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Only select options from the VISIBLE dropdown
// @author       You
// @match        https://hsp.pmeat.gov.bd/applicant/applicantForm
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================================================
    // ইনপুট আইডি এবং অপশন ইনডেক্স (০ = ১ম অপশন, ১ = ২য় অপশন...)
    // ==========================================================================
    const fieldConfig = {
        'religion': 0,
        'birthPlaceId': 5,
        'currentEducationDiscipline': 3,
        'currentEduClass': 2,
        'currentInstituteAdmissionSession': 0,









    };

    async function fillAntdByVisibleIndex(inputId, optionIndex) {
        return new Promise((resolve) => {
            console.log(`প্রসেসিং: ${inputId} এর ${optionIndex + 1} নম্বর অপশন...`);

            const input = document.getElementById(inputId);
            if (!input) {
                console.log(`❌ ফিল্ড পাওয়া যায়নি: ${inputId}`);
                return resolve();
            }

            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();

            // ১. ড্রপডাউন ওপেন করা
            const triggerEvents = ['mousedown', 'mouseup', 'click'];
            triggerEvents.forEach(evtType => {
                selector.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
            });

            let found = false;
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;

                // গুরুত্বপূর্ণ পরিবর্তন: শুধুমাত্র সেই ড্রপডাউনটি খুঁজবো যা 'hidden' ক্লাসের বাইরে (Active)
                const activeDropdown = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');

                if (activeDropdown) {
                    // শুধুমাত্র এই Active ড্রপডাউনের ভেতরের অপশনগুলো নেওয়া হচ্ছে
                    const options = activeDropdown.querySelectorAll('.ant-select-item-option');

                    if (options.length > optionIndex) {
                        const targetOption = options[optionIndex];

                        const optEvents = ['mousedown', 'mouseup', 'click'];
                        optEvents.forEach(evtType => {
                            targetOption.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
                        });

                        found = true;
                        console.log(`✅ সফলভাবে সিলেক্ট করা হয়েছে: ${inputId} (Index: ${optionIndex})`);
                    }
                }

                if (found || attempts > 30) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 200);
        });
    }

    async function startAutoFill() {
        console.log("🚀 Advanced Auto-Fill শুরু হচ্ছে...");

        for (const [inputId, index] of Object.entries(fieldConfig)) {
            await fillAntdByVisibleIndex(inputId, index);
            // একটি ফিল্ড শেষ হওয়ার পর ড্রপডাউনটি বন্ধ হতে এবং রিয়্যাক্ট স্টেট আপডেট হতে সময় দিন
            await new Promise(r => setTimeout(r, 1200));
        }

        console.log("🏁 সব কাজ সম্পন্ন হয়েছে!");
    }

    window.addEventListener('load', () => {
        // পেজ লোড হওয়ার পর পর্যাপ্ত সময় দিন
        setTimeout(startAutoFill, 4000);
    });
})();
