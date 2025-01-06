# 1. Database Structure

## Tables/Collections:

### Users:

**Fields**: id, email, password, **profileStatus** **(pending, incomplete, waiting_approval, approved)**, generalDetails, additionalDetails, **completedSteps**, etc.
profileStatus is the primary field to determine the user's state.

### Admin:

Fields: id, email, password, etc.
Admin can approve/reject user profiles.

# 2. Backend API

## Endpoints:

### Registration:

Saves step-by-step data to the database. On step completion, update completedSteps and check if all steps are complete.

### Login:

Verifies credentials and returns a token with user info (JWT or session).

### Get User Details:

Returns user status (profileStatus), completed steps, and other details.

### Update Profile Completion:

Allows updating the profile and ensures it transitions to the correct state.

### Admin Approval:

Approves/rejects user profiles.

# 3. Frontend Implementation

## A. Registration (Three Steps)

### Flow:

#### Step 1: General Details:

Save data locally or to the server using an API call.
On success, redirect to Step 2.

#### Step 2 & 3:

Repeat the same pattern as Step 1.
On completing the last step, update profileStatus to waiting_approval on the backend.

### Redirect:

After completing Step 1, redirect the user to the login page.

## B. Login

### Login Logic:

Authenticate the user via API.
Save the user token (JWT/session) in localStorage or cookies.

### Redirect:

Check profileStatus on login.
If profileStatus is incomplete, redirect to the registration page to complete the profile.
If waiting_approval, redirect to the dashboard but restrict features.
If approved, allow full dashboard access.

## C. Dashboard

### Conditional Rendering:

On dashboard load, fetch user details (profileStatus) via an API call.
Render based on profileStatus:
incomplete: Show a notification to complete the profile and restrict all features except "Logout."
waiting_approval: Show a notification to wait for admin approval and restrict features.
approved: Allow full access.

### Logout Button:

Always keep the "Logout" button accessible.

### Notifications:

Use a notification system (e.g., toasts) to alert users about the current state:
"Complete your profile to access all features."
"Waiting for admin approval."

# 4. Notifications

## Logic:

Notifications for profile completion:

Triggered on the dashboard if profileStatus === incomplete.
Notification for admin approval:

Triggered after completing all steps and transitioning to waiting_approval.
Avoid Duplicate Notifications:

Use a flag or timestamp to track if a notification has already been sent.

# 5. Backend Logic

## State Transitions:

### Incomplete Profile:

Default state after Step 1.
Prevent access to dashboard features.

### Waiting for Approval:

Set when all steps are complete.
Allow restricted dashboard access with a waiting notification.

### Approved:

Set by the admin.
Allow full dashboard access.
