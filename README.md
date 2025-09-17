# 🌙 Lumio – The Student Life Hack You Didn’t Know You Needed

> Built in 48 hours of sleep-deprived wizardry at Encode Hackathon London 2025

---

## 🧠 What Is Lumio?

Welcome to *Lumio*, your new academic BFF.  

Lumio is a collaborative study platform built in 48 hours at the Encode Hackathon London 2025.
It integrates note-taking, deadline tracking, and AI-powered flashcards into one seamless student toolkit.  

It’s like if Google Calendar, Notion, and ChatGPT had a baby… 

We built *three mini-apps* that are smarter together, for studying:

| 🧩 Mini-App   | Superpower |
|--------------|------------|
| *NoteBank* | Shared notes with tags for better organization |
| *SemSync*  | Track deadlines, classes, and exams |
| *CramBot*  | AI that turns notes into flashcards |

All apps communicated through the **Tonk stack**, a shared datastore enabling seamless integration. 🧙‍♂✨

---

> 🏆 **Award:** First Place, Encode Club AI Hackathon London 2025

## 👨‍💻 My Contribution (Muhammed Nawfal)

- Designed and developed the **full UI for NoteBank** (React).
- Integrated NoteBank with the shared Tonk backend and database.
- Contributed to testing and final demo polish during hackathon.

> Note: This project was originally pushed under a different GitHub account during the Encode Club Hackathon.  
> The repository has been mirrored here to keep all projects under one profile.  
> My contributions are detailed above.

---

## ⚙ Tech Stack – aka “Stuff We Glued Together at 3AM”

- 🧠 **Backend/Data:** Tonk Toolchain (shared datastore)  
- ⚛ **Frontend:** React, Vite
- 🪄 **AI:** Ollama API (flashcard generation)  
- ⏰ **Utilities:** date-fns  

---

## 🎥 Demo Vibes

### 📝 NoteBank  
![NoteBank Demo](./screenshots/notebank.gif)  

![image](https://github.com/user-attachments/assets/020ff91a-c83c-4d4b-9a41-36bdd360af46)

### 📅 SemSync  
![SemSync Demo](./screenshots/semsync.gif)  

![image](https://github.com/user-attachments/assets/1d4034e2-a861-49ef-b6ca-b43e16eb00b9)

### 🤖 CramBot  
![CramBot Demo](./screenshots/crambot.gif)  

![image](https://github.com/user-attachments/assets/b581a2d7-9acb-4902-be57-39fe3d51325c)

---

## 🕵‍♀ How the Magic Happens

```
You → Write notes & deadlines
     ↓
Tonk → Glues it all together
     ↓
CramBot → Summarizes it into flashcards and pings you before your grades drop

```
---

## 🕵 How It Works

<details>
<summary>👨‍💻 Click here for installation instructions</summary>


Clone the repository
```
git clone git@github.com:Muhammed-Nawfal/Encode-Tonk.git && cd Encode-Tonk
```

Install dependencies
```
npm install
```
Run each app separately:
```
npm run dev
```
Then open ``` http://localhost:3000 ``` and start vibing


</details>

---

## 🧠 Behind the Madness

| Name     | What They Broke Built |
|----------|------------------------|
| Nithin   | UI/UX design, SemSync development |
| Nawfal   | NoteBank UI |
| Nethra   | Prompt engineering and CramBot development |
| Raisa    | Integration and documentation |

---

## 🚀 Future Improvements

- Group flashcard sharing and quizzes  
- Browser extension for deadline reminders  
- Mobile version for cross-platform access 

---

## 📚 Useful Stuff

- [🧙‍♂ Tonk Docs (they're actually good)](https://tonk-labs.github.io/tonk/)
- [📦 Our Code (chaos included)](https://github.com/raisa05/Encode-Tonk)

---

> *Built with love, caffeine, and mild panic.*  
> *#TeamLumio #EncodeHackathon #WeSurvived*
