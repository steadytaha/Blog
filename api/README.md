# Firebase Service Account

This application uses Firebase Admin SDK for backend services like secure authentication. To enable these features, you need to provide a Firebase service account key.

## How to get your `serviceAccountKey.json`

1.  **Go to your Firebase project settings:**
    *   Open the [Firebase console](https://console.firebase.google.com/).
    *   Select your project from the list.
    *   Click the gear icon next to "Project Overview" and select "Project settings".

2.  **Navigate to the Service accounts tab:**
    *   In the project settings page, click on the "Service accounts" tab.

3.  **Generate a new private key:**
    *   Click the "Generate new private key" button.
    *   A confirmation dialog will appear. Click "Generate key".
    *   This will download a JSON file to your computer.

4.  **Use the key in your project:**
    *   Rename the downloaded file to `serviceAccountKey.json`.
    *   Place this file in the `Blog/api` directory of this project.

**Important:** Treat this file like a password. Do not commit it to version control or share it publicly. Make sure to add `serviceAccountKey.json` to your `.gitignore` file. 