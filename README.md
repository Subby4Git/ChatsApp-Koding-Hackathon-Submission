ChatsApp-Koding-Hackathon-Submission
====================================

My Koding Hackathon submission - ChatsApp

Hi guys. This is my GitHub repository for my ChatsApp application.

## Description
The theme I selected is the communication and translation theme.

ChatsApp is a global, realtime, and auto-translated chat app that allows users of different languages to speak in real-time (through the PubNub api) as if they were all speaking in the same language! 
The user specifies his/her language (Default: English), and (optionally) a user name. That's it! Then, the user can type or speak with the mic (only in Chrome) in their own language. However, other users will be recieving the chats in their own languages.
In addition, it will be read to them in their language, so it mimics the Star Trek universal translation. The Star Trek universal translation really motivated me.

Microsoft is currently building a universal translation system into Skype, with the same idea, so that really got me interested.

This project addresses the theme behind the Communication theme, because it allows people who speak different languages, to speak with others of different languages in realtime, as if they all spoke the same language!

## Screenshots

Here are some screenshots of my project in the Koding IDE. It definitely looks better in the browser!  ;)

http://d.pr/i/18MR5/1Vj6kDsB
http://d.pr/i/1bsZ2/3ggArEKs
http://d.pr/i/1ftCO/2zcRQsd4
http://d.pr/i/1fvrI/238rpPp7
http://d.pr/i/1fvrI

## APIs used

- jQuery for faster coding (write less, do more...)
- WebSpeech API (for text-to-speech and speech recognition)
- PubNub API (used extensively. this is what drives the realtime aspects of my app, like updated user information and incoming chats. Also greatly reduced the number of API calls made to my NodeJS Server!)
- Yandex Translation API (As you might have guessed, this API was used for fast translation over 44 different languages! Please do note that this App is on the free plan, hence there will be a limited number of API calls.


