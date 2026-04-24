// ==UserScript==
// @name         HSP Form Final Auto-Fill
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Auto fill Religion and Birth Place for HSP Form
// @author       You
// @match        https://hsp.pmeat.gov.bd/applicant/applicantForm
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // এখানে আপনার ফিল্ডের ID এবং ভ্যালু সেট করা হয়েছে
    // ==========================================
    const fieldsToFill = {
        'religion': 'ইসলাম',
        'birthPlaceId': 'বগুড়া',
    };

    async function fillAntdSelect(elementId, targetValue) {
        return new Promise((resolve) => {
            console.log(`${elementId} ফিল করার চেষ্টা করা হচ্ছে: ${targetValue}`);

            const input = document.getElementById(elementId);
            if (!input) {
                console.log(`❌ ফিল্ড পাওয়া যায়নি: ${elementId}`);
                return resolve();
            }

            const selector = input.closest('.ant-select-selector');
            if (!selector) return resolve();

            // ড্রপডাউন ওপেন করার জন্য প্রয়োজনীয় ইভেন্টসমূহ
            const triggerEvents = ['mousedown', 'mouseup', 'click'];
            triggerEvents.forEach(evtType => {
                selector.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
            });

            let found = false;
            let attempts = 0;

            const checkInterval = setInterval(() => {
                attempts++;
                // পুরো পেজে অপশনগুলো খোঁজা হচ্ছে
                const options = document.querySelectorAll('.ant-select-item-option-content');

                options.forEach(option => {
                    if (option.innerText.trim() === targetValue) {
                        const optEvents = ['mousedown', 'mouseup', 'click'];
                        optEvents.forEach(evtType => {
                            option.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
                        });
                        found = true;
                        console.log(`✅ সফলভাবে সিলেক্ট করা হয়েছে: ${targetValue}`);
                    }
                });

                if (found || attempts > 30) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 200);
        });
    }

    async function startAutoFill() {
        console.log("🚀 অটো-ফিল প্রসেস শুরু হচ্ছে...");

        // একটির পর একটি ফিল্ড পূরণ করবে যাতে রিয়্যাক্ট কনফিউজড না হয়
        for (const [id, value] of Object.entries(fieldsToFill)) {
            await fillAntdSelect(id, value);
            // দুটি ফিল্ডের মাঝে ০.৭ সেকেন্ড গ্যাপ রাখা হয়েছে
            await new Promise(r => setTimeout(r, 700));
        }

        console.log("🏁 সব ফিল্ড সফলভাবে পূরণ করা শেষ!");
    }

    // পেজ লোড হওয়ার ৩ সেকেন্ড পর অটো-ফিল শুরু হবে
    window.addEventListener('load', () => {
        setTimeout(startAutoFill, 3000);
    });
})();
