// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-04-24
// @description  try to take over the world!
// @author       You
// @match        https://hsp.pmeat.gov.bd/applicant/applicantForm
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ১. আপনার পছন্দমতো অপশনটি এখানে লিখুন
    const targetValue = "ইসলাম";

    async function forceSelectAntd() {
        console.log("Force Fill শুরু হচ্ছে...");

        // ২. religion ফিল্ডটি খুঁজে বের করা
        const input = document.getElementById('religion');
        if (!input) {
            console.log("ফিল্ড পাওয়া যায়নি!");
            return;
        }

        // ৩. সেলেক্টরটি খুঁজে বের করা এবং সেখানে ইভেন্ট ফায়ার করা
        const selector = input.closest('.ant-select-selector');
        if (!selector) return;

        // রিয়্যাক্ট যাতে বুঝতে পারে আমরা ক্লিক করেছি, তাই একাধিক ইভেন্ট পাঠানো হচ্ছে
        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(evtType => {
            selector.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
        });

        console.log("ড্রপডাউন ওপেন করার চেষ্টা করা হয়েছে...");

        // ৪. অপশনটি খুঁজে বের করে ক্লিক করার জন্য লুপ চালানো
        let found = false;
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;
            // Ant Design-এর অপশনগুলোর ক্লাস সাধারণত এটি হয়
            const options = document.querySelectorAll('.ant-select-item-option-content');

            options.forEach(option => {
                if (option.innerText.trim() === targetValue) {
                    // অপশনেও একইভাবে একাধিক ইভেন্ট ফায়ার করা
                    const optEvents = ['mousedown', 'mouseup', 'click'];
                    optEvents.forEach(evtType => {
                        option.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
                    });
                    found = true;
                    console.log("সফলভাবে সিলেক্ট করা হয়েছে: " + targetValue);
                }
            });

            if (found || attempts > 30) {
                clearInterval(checkInterval);
                if (!found) console.log("অপশনটি খুঁজে পাওয়া যায়নি।");
            }
        }, 200);
    }

    // পেজ লোড হওয়ার পর একটু সময় দিয়ে চালানো
    window.addEventListener('load', () => {
        setTimeout(forceSelectAntd, 2000);
    });
})();
