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
- write unit tests for core functionality (close to done)
  - build graph (minimally tested)
  - get current day (kinda works...)
  - get is completed (done)
- fix router parsing bug 001 (done)
  - eurika! javascript global function => encodeUriComponent
    - nvm...
  - new thought is to create some more extensive routing logic and put it in functions
   - this way i can pass around aditional variables, check the type of next variable and handle it with known peer variables
  - now the way that i'm doing it is super fucking jank
  - fixed it with my own routing module <= this worked!
- validate that my hack fixes 002 (done)
  - it does not...
  - maybe i could just make a cloud function that observes changes to user profile picture and batch writes it to particpants
  - simpler maybe i could just read the profile photo from the user <= this worked!
- route to a confirmation page to fix 003 (done)
  - fixed it by fetching users
- deploy on vercel

## known bugs
- (001) profile-photo route to router.query.next has a bug where it doesn't parse "%3F" as "?"
- (002) there is a bug when the account gets created it can't successfully set the auth current user profile photo so the participant photo doesn't get set (hacked this one)
- (003) marking a completion sometimes show the wrong ui or will navigate you off the page
- (004) dates kinda near the start date of a challenge are a little iffy if we're calling it day 0 or day 1

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
- move toggle completion to cloud function for security
- lower bundle size
  - switch from chakra spinner to tailwind spinner
  - switch from mui copy icon to single svg
- add lucas' confetti to confirmation page
- add confetti to challenge creation
- add confetti to accept invite
- add haptics everywhere there is confetti
- implement cloud functions to use server timestamp for date functions to improve security and fix 004

## 1,000+ users todos
- premium plan
  - limit challenges to 25 participants for free tier
  - unlimited on premium
  - optionally require proof of completion
  - set start date in future with countdown
  - challenges that don't expire