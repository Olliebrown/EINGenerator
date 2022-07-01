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

Secrets need to be defined in `.env` as follows:
- 

Starting up the program is as follows:
- Clone the repo or download the latest code
- run `npm install` in the root direclty to install needed dependencies
- run `npm run build` to generate the static client pages
- run `npm start` to start up the server
- Visit `http://localhost:3000` to access the tool
