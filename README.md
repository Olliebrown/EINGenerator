# EINGenerator
A tool for helping identify and manage voters semi-anonymously in small elections or formal votes and decisions via email.

An EIN is an election identification number, similar to a PIN, that helps anonymize voters while still being a unique identity to ensure only those who are allowed to vote do so and to prevent abuse or accidental duplicates.  EINGenerator is a comprehensive tool for generating, distributing, and monitoring the use of EINs for any email voting.  You give it a list of names with emails, setup an election with a link to a survey and that survey's responses (via google forms), and it will send out official ballot emails and track responses without revealing names of voters or their votes.

## Features
EINGenerator provides the following:
- Tracking of pools of voters separate from elections.
- Sending of ballots via email automatically using a 3rd party service (send in blue).
- Tracking of how many voters have responded, how many remain, and any anomalies.
- COMING SOON: Ability to send reminder emails and "thank you" emails without revealing who still has or hasn't voted

## Is it Really Anonymous?
Anonymity is only maintained passively: names are hidden behind the EIN and translating that into a name is difficult, but not impossible for those that can access the underlying database. Anyone that uses the tool to send out ballots and monitor responses MUST be trusted to do so in good faith!  It is meant to help run an honest vote but does not take any active steps to actually obfuscate, hash, or encrypt information.  It only makes it difficult to know how someone voted, not impossible (mathematically or otherwise).

# Usage
EINGenerator is built around some common Web 2.0 technologies.  You will need the following tools to run it:
- node.js installed locally
- A working mongodb instance and credentials (free cloud account works fine)
- A send-in-blue account and credentials (free can work for reasonably sized voter pools)

## Configuration
Secrets need to be defined in a `.env` file in the root directory as follows:
- DB_USER: The username for the mongodb account
- DB_PASS: The plaintext password for the mongodb account
- DB_NAME: The name of the database to use in the mongodb account
- SIB_SMTP_USER: The send-in-blue account username
- SIB_SMTP_PW: The send-in-blue account plaintext password
- SMTP_SEND: Can be 'true' or 'false' (set to 'false' to simulate instead of sending)
- SHEETS_APP_ID: The google sheets app ID for accessing the google forms results sheet.
- SHEETS_CLIENT_ID: The client account under the google app ID
- SHEETS_CLIENT_SECRET: The secret token for the google app ID client account
- SHEETS_REDIRECT_URI: The URI used for redirection after authenticating (must be registered with the given app ID)

If SMTP_SEND is set to false, the system will instead attempt to use etherial email to simulate the sending. You should provide the following credentials in the `.env` file in this case:
- TEST_SMTP_USER: The etherial email user account
- TEST_SMTP_PW: The password for the etherial email account

## Running
Starting up the program is as follows:
- Clone the repo or download the latest code
- run `npm install` in the root direclty to install needed dependencies
- run `npm run build` to generate the static client pages
- run `npm start` to start up the server
- Visit `http://localhost:3000` to access the tool

## Basic Usage
Creating an election is a two-step process:
- Create a new Voter Pool with names and emails (click the plus in the bottom right while on the Voter Pools tab)
- Create a new Election for that voter pool
  - You will need a link to a Google form that is set up with the proper questions and a field for the user's EIN to be entered.
  - You also need a link to a Google sheet with the form results so it can count responses for you.

Sending Emails is as follows:
- First, generate the EINs for this election (they are unique to every election, not just to every user)
- Second, click 'send emails' and type or paste in the info for the email
- Confirm and send and it will email each person in the voter pool

It's usually good to follow up with everyone from your personal email and let them know to look in their clutter and/or spam folders as it often winds up there.

Sending reminders and thank yous:
- Make sure you've entered the ID of the Google sheet that holds the results
- Click the small person icon in the upper right and log into a Google account that has access to that sheet
- Expand the election and look for the 'send thank yous' and 'send reminders' buttons
- You should be able to click those to send messages to either everyone that already voted or everyone that has not yet voted
