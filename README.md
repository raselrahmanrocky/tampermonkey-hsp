# HSP-MIS Automation Assistant 🚀
**A Tampermonkey Userscript to streamline and speed up data entry on the Bangladesh Harmonized Stipend Program (HSP) portal.**

---

## 📌 Overview
The **HSP-MIS Automation Assistant** is designed for teachers and data entry operators in Bangladesh who work with the [HSP-MIS Portal](https://hsp.pmeat.gov.bd/). This script automates repetitive tasks, reduces manual entry errors, and significantly speeds up the student registration process.

## ✨ Features
- **Auto-Fill Addresses:** Automatically copy the "Present Address" to the "Permanent Address" field with a single click.
- **Pre-defined Selections:** Set default values for Division, District, and Upazila to avoid repeated selection.
- **Smart Navigation:** Faster transition between form tabs (Basic Info, Enrollment, Payment Info, etc.).
- **UI Enhancement:** Cleans up unnecessary elements to provide a more focused workspace.
- **Data Validation:** Basic client-side checks to ensure mandatory fields are not left blank.

## 🚀 Installation

Follow these steps to get the script running:

### Step 1: Install a Userscript Manager
You need an extension installed in your browser to run this script.
- **Chrome/Edge/Brave:** Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox:** Install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- **Firefox:** Install [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
### Step 2: Install the Script
1. Go to the [hsp-script.user.js](./hsp-script.user.js) file in this repository (or your specific script file).
2. Click the **"Raw"** button.
3. Tampermonkey will automatically detect the script and open an installation tab.
4. Click **Install**.

### Step 3: Start Using
1. Log in to the [HSP-MIS Portal](https://hsp.pmeat.gov.bd/).
2. The script will activate automatically on the data entry pages.
3. Look for new automation buttons or pre-filled fields.

## 🛠 Configuration
You can customize the script by editing the variables at the top of the code:
```javascript
// Example: Set your default Upazila
const defaultDistrict = "Your District";
const defaultUpazila = "Your Upazila";
```

## ⚠️ Disclaimer
- **Data Privacy:** This script runs entirely locally in your browser. It **does not** collect, store, or transmit any student data to any external server.
- **Use Responsibly:** This is an unofficial tool. Ensure you double-check all data before clicking the final "Submit" button on the government portal. The developer is not responsible for any data entry errors.

## 🤝 Contribution
Contributions are welcome! If you have ideas for new features or find any bugs:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/NewFeature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---
**Developed with ❤️ by [Rasel Rahman Rocky](https://github.com/raselrahmanrocky)**

---
