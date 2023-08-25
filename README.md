# iChallenge U

Create custom leaderboards to compete with friends!

## How it works

- Create a new challenge with a start date and a specified number of days the challenge will last.
- Invite users via an open invite link or by phone number.
- Each day, users will have the opportunity to log a completion for the day and upload photographic evidence if required by the group.
- Check back to see a leaderboard ranking participants based on their current streak and total completions.
- When the challenge ends, the leaderboard will be updated with a trophy case featuring the winners of the challenge.
- Have fun!

## todos

- add profile photos to participants (done)
- implement default profile photos (done)
- add profile photos to leaderboard ui (done)
- add edit banner to profile photo component (done)
- clean up share sheet for leaderboard (done)
- bulletproof mark completed (done)
- add analytics to each page (done)
- style join page (done)
  - MAJOR BUG: profile-photo upload page doesn't parse next url correctly ()
    - best fix is probably to get a bit more precise about how i'm passing around these variables
- write unit tests for core functionality (pretty much done)
  - build graph (minimally tested)
  - get current day (kinda works...)
  - get is completed (done)

  ONLY 1 BUG BLOCKING!!!
- deploy on vercel

## stretch todos
- nice success messages on profile
- image cropping
- image resizing
- delete old profile photos on change
- sorting challenges on homepage
- ranking public challenges on homepage
- build landing page to describe functionality if you aren't logged in
- dark mode
- add join records in the database

## 1,000+ users todos
- premium plan
  - limit challenges to 25 participants for free tier
  - unlimited on premium
  - optionally require proof of completion
  - set start date in future with countdown
  - challenges that don't expire