---
title: GitHub 上傳與部署完整指引
created: 2026-04-27
audience: 從沒用過 git 的初學者也能照做
estimated_time: 第一次 30 分鐘，之後每次更新 5 分鐘
---

# GitHub 上傳與部署完整指引

## 0. 為什麼要上 GitHub

| 好處 | 說明 |
|---|---|
| **永遠不會丟** | 雲端備份，硬碟壞了也在 |
| **版本紀錄** | 所有改動有 history，可隨時回到舊版本 |
| **自動部署** | 啟用 GitHub Pages 後，push 完幾分鐘就上線 |
| **協作 / 分享** | 任何人能 fork 您的專案、提 PR |
| **保有著作權** | LICENSE 標您的名字（已用 MIT，見 ADR-007） |
| **未來找工作** | GitHub 有作品集是工程師標配 |

---

## 1. 一次性準備（只做一次）

### 1.1 安裝 Git for Windows

1. 訪問 https://git-scm.com/download/win
2. 下載最新版（會自動偵測您的系統 — 64-bit）
3. 執行安裝程式，**所有選項用預設值**就好（直接按 Next 到底）
4. 裝完後，打開 cmd 確認：
   ```cmd
   git --version
   ```
   應該回傳類似 `git version 2.45.0.windows.1`

### 1.2 註冊 GitHub 帳號

1. 訪問 https://github.com/signup
2. 用您的 email（建議用 **gmail，不要用工作信箱**，避免換工作後失聯）
3. 設定 username（**會出現在 URL 中，挑短的、好記的**，如 `seyen37`）
4. 驗證 email

### 1.3 設定 Git 身份

cmd 裡執行（**只做一次，這個 Git 全域設定**）：

```cmd
git config --global user.name "您的 GitHub username"
git config --global user.email "您的 GitHub 註冊 email"
```

例如：
```cmd
git config --global user.name "seyen37"
git config --global user.email "seyen37@gmail.com"
```

### 1.4 設定 GitHub 認證（PAT — Personal Access Token）

GitHub 不再支援密碼登入，要用 token：

1. 訪問 https://github.com/settings/tokens
2. 點 **Generate new token** → **Generate new token (classic)**
3. **Note** 填 `Petoi Bittle Koding`
4. **Expiration** 選 90 days（或 No expiration）
5. **Scopes** 勾 ☑️ **repo**（其他不必勾）
6. 點 **Generate token**
7. **複製 token**（離開頁面就再也看不到！）— 存到密碼管理員或記事本

之後 git push 要密碼時，貼這個 token（不是 GitHub 密碼）。

---

## 2. 第一次上傳專案

### 2.1 在 GitHub 建立空 repo

1. 訪問 https://github.com/new
2. **Repository name**：`petoi-bittle-koding`
3. **Description**：`Scratch-like 網頁編程工具，給 Petoi Bittle 機器狗`
4. **Public**（這樣才能用 GitHub Pages 免費版）
5. ⚠️ **不要**勾「Add README」、「Add .gitignore」、「Add license」（我們已有了）
6. 點 **Create repository**

建好後 GitHub 會顯示一個指引頁面，記得頁面上的 URL 類似：
```
https://github.com/seyen37/petoi-bittle-koding.git
```

### 2.2 在本地端初始化 Git + 推上去

打開 cmd，cd 到專案資料夾：

```cmd
cd C:\Users\F0012\Documents\CoWork\Petoi\petoi-bittle-koding
```

執行以下命令（**第一次設定，每行依序執行**）：

```cmd
git init
git add .
git commit -m "Initial commit: Petoi Bittle Koding MVP v0.1.0"
git branch -M main
git remote add origin https://github.com/<您的 username>/petoi-bittle-koding.git
git push -u origin main
```

把 `<您的 username>` 換成您的 GitHub username。

第一次 push 會問帳密：
- **Username**：您的 GitHub username
- **Password**：貼 1.4 的 PAT token（不是密碼）

成功的話會看到：
```
Enumerating objects: ...
Writing objects: 100% (xx/xx), done.
To https://github.com/<your>/petoi-bittle-koding.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 2.3 啟用 GitHub Pages

1. 在 GitHub 訪問您的 repo（`https://github.com/<your>/petoi-bittle-koding`）
2. 點上方 **Settings**
3. 左側選單 **Pages**
4. **Source** 選 `Deploy from a branch`
5. **Branch** 選 `main` / `/ (root)`
6. 點 **Save**
7. **等 1-3 分鐘**，刷新 Settings → Pages 會顯示：
   ```
   Your site is live at https://<your>.github.io/petoi-bittle-koding/
   ```
8. 點開那個 URL，您的 Bittle Koding 已經線上可用

✅ 從現在起，您（或任何人）可以從這個 URL 用您的工具：
```
https://<your>.github.io/petoi-bittle-koding/
```

---

## 3. 後續每次更新（5 分鐘）

之後 Cowork session 改完 code，要更新 GitHub：

```cmd
cd C:\Users\F0012\Documents\CoWork\Petoi\petoi-bittle-koding
git add .
git commit -m "feat: 加 v0.2 步態積木"
git push
```

3 個命令搞定。Pages 會自動更新（等 1-3 分鐘）。

**Commit message 撰寫慣例**（建議遵守）：

| 前綴 | 用於 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | bug 修復 |
| `docs:` | 文件變更 |
| `refactor:` | 重構（不影響功能）|
| `style:` | CSS / 排版 |
| `test:` | 加測試 |
| `chore:` | 雜項（依賴更新等）|

例如：
- `feat: add 50 new action blocks for v0.2`
- `fix: SVG transform bug in simulator`
- `docs: update WORKLOG and DECISIONS for round 5`

---

## 4. 進階：GitHub Actions 自動部署（選配）

預設情況下 Pages 會自動 build，但如未來加 build pipeline（如轉 markdown 為 HTML）時可考慮。**v0.1 不需要**，留作未來參考。

範例 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

---

## 5. 故障排除

| 症狀 | 原因 | 解法 |
|---|---|---|
| `git push` 卡在 password | 在貼 PAT | 確認貼的是 token 不是 GitHub 密碼 |
| `error: failed to push` | 遠端有您本地沒有的 commit | `git pull --rebase` 後再 `git push` |
| GitHub Pages 訪問 404 | 部署還沒完成 | 等 3 分鐘，刷新 Settings → Pages |
| Pages 顯示舊版 | 瀏覽器 cache | Ctrl + F5 強制重整 |
| 程式在 GitHub Pages 上跑不對 | 路徑大小寫問題（Windows 不分 / Linux 分） | 檢查所有檔案引用的大小寫一致 |
| 不小心 commit 了密碼 / token | 已 push 到 GitHub | **立刻撤銷 token + 重新建一個**，並用 BFG repo cleaner 清歷史 |

---

## 6. 安全提醒

- **絕對不要**把 API key、密碼、token 寫在 code 裡 commit 到 GitHub
- 用 `.env` 檔（已在 `.gitignore` 排除）
- 公開 repo 的所有歷史**永遠存在**（即使刪掉 commit，舊 hash 仍可訪問）
- 機密 / 商業專案用 **Private repo**（GitHub 免費版 unlimited private repos）

---

## 7. 與工作紀錄系統整合

每次 git commit 之前，請先：
1. 更新 `WORKLOG.md`（append 新 Round 條目）
2. 如有架構決策，更新 `DECISIONS.md`（append 新 ADR）
3. 然後 git add . / commit / push

這樣 WORKLOG / DECISIONS 也跟著上 GitHub，未來看 commit 歷史就能對應到當時的決策脈絡。

---

## 8. 常用 Git 命令速查

| 命令 | 用途 |
|---|---|
| `git status` | 看當前有什麼變動 |
| `git diff` | 看變動的內容 |
| `git log --oneline` | 看 commit 歷史（簡略）|
| `git log --oneline -10` | 看最近 10 個 commit |
| `git checkout -- <file>` | 還原某個檔案的變動 |
| `git reset HEAD~1` | 撤銷最後一次 commit（保留改動） |
| `git stash` | 暫存當前變動（之後 `git stash pop` 還原）|
| `git branch -a` | 看所有分支 |
| `git checkout -b feature-xxx` | 建立並切換到新分支 |

---

*GitHub 部署指引 v1.0 完成於 2026-04-27。每次 GitHub 政策變動時更新（如 PAT 規則、Pages UI 改版等）。*
