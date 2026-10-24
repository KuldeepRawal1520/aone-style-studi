# AONE Style Studio booking backend setup

This folder contains the Google Apps Script backend. The website is **not connected yet**. Do not tell customers online booking is live until you have deployed and tested it.

## 1. Create the private booking spreadsheet
1. Sign in to the Google account that should own the booking system.
2. Open https://script.google.com and create a new project named **AONE Style Studio Bookings**.
3. Replace the default `Code.gs` content with the contents of this repository's `backend/Code.gs`.
4. Click **+** beside Files, choose **HTML**, name it exactly `Booking`, and paste `backend/Booking.html`.
5. Save the project. In the function dropdown, choose `setup` and click **Run**. Approve the requested Google Sheets permissions.
6. The first run creates a private spreadsheet called **AONE Style Studio - Private Bookings**. Keep it private. Share it with Ashok only if needed.

## 2. Deploy the booking page
1. Click **Deploy → New deployment**.
2. Select the gear icon / deployment type **Web app**.
3. Set **Execute as** to your account.
4. Set access to **Anyone** so customers can open the booking page without signing in. Only publish this after testing; the form accepts public requests.
5. Click **Deploy**, approve permissions if prompted, and copy the Web app URL ending in `/exec`.

The deployed page provides service selection, availability checks, booking submission, and email notifications. It uses `google.script.run` from a page served by Apps Script, avoiding cross-origin browser requests.

## 3. Configure and test before public use
- Test with your own email address first, not a real customer.
- Confirm a test request appears in the private sheet with status `PENDING`.
- Confirm the test customer and `doliyaashok101@gmail.com` both receive email.
- Submit two requests for the same time in separate browser sessions; only one should be accepted.
- Change a test row's Status to `CANCELLED` and verify the slot becomes available again.
- Remove test rows after testing. Do not use real customer data in tests.

## Current service durations
- Men's Haircut: 30 minutes
- Regular Children's Haircut: 30 minutes
- Women's Haircut: 45 minutes
- Clean Up: 15 minutes
- Smoothing (Men) and Smoothing (Women): disabled until Ashok confirms durations.

The system uses 15-minute start-time increments, studio hours 10:00 AM–8:00 PM, and Toronto time. Requests start as `PENDING`; the customer is told the appointment is not confirmed until Ashok follows up. Pending requests reserve their time until the sheet's Status is changed to `CANCELLED` or `REJECTED`. Confirm by email or phone for this first prototype.

## 4. Website integration
The current Vercel site is still a static page and cannot safely call this Apps Script backend directly and read the result due to browser cross-origin restrictions. For the prototype, share the deployed Apps Script `/exec` URL as the booking link. Once tested, the site's booking button can be connected to that URL. Do not put secrets or spreadsheet IDs in public website code.
