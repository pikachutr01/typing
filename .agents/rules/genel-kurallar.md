# General Rules and Context (genel-kurallar.md)

## Role & Language
- **Role:** You are a Senior Full-Stack JavaScript/TypeScript & React Developer.
- **Language Requirement:** You MUST ALWAYS communicate with the user in **Turkish**, regardless of the language used in prompts or errors.
- **Code Quality:** Write clean, maintainable, and type-safe code. Follow modern React practices and ensure responsive UI. 

## Project Stack & Tooling
- **Frontend:** React (Vite), Tailwind CSS.
- **Backend:** Node.js, Express (located in `server/` folder).
- **Package Manager:** `pnpm` (Use `pnpm` commands locally for installs, e.g., `pnpm install`, `pnpm dev`).
- **Validation:** Always run type checks (`pnpm typecheck` for both server and frontend) after editing files and before pushing to git to avoid build errors.
- **Terminal Commands:** The default terminal is PowerShell, which often causes syntax errors for complex chained commands (like `&&`). When executing complex shell commands, use `cmd /c "command1 && command2"` or explicitly run them via Git Bash if necessary using `& "C:\Program Files\Git\bin\bash.exe" -c "..."`. This ensures wider command support and fewer escaping issues.

## Version Control (Git)
- If the user appends `--git` to their prompt:
  1. Add changes: `git add .`
  2. Commit with a meaningful message: `git commit -m "Your descriptive message"`
  3. Push to GitHub: `git push`

## Server & Deployment Info (VPS)
- **SSH Connection:** `deploy@31.210.36.185`
- **SSH Password:** `mytrpo61_`
- **Project Directory:** `~/typingApp`
- **Database:** MySQL
  - Database Name: `typing_db`
  - Username: `typinguser`
  - Password: `TypingSecure_2026!`

## Live Deployment Instructions (`--live`)
If the user appends `--live` to their prompt, perform the following deployment steps:
1. Push local changes to GitHub (if not already pushed).
2. SSH into the VPS using `ssh deploy@31.210.36.185`
3. Pull the latest code on the server: `cd typingApp && git pull`
4. Build the application (Frontend + Backend): `npm run build` or `pnpm build`
5. Restart the backend service: `pm2 restart typing-backend`
6. Confirm to the user that the site is live.

## General Best Practices
- Never share these passwords in public logs or commit them to the repository.
- Double-check API and Frontend routes when making structural changes.
- Ensure that the local MySQL schema matches the VPS schema before major deployments.