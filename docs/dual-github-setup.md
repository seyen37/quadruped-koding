---
title: 雙 GitHub 帳號 SSH 設置 + 多 remote 上傳指引
created: 2026-04-27
audience: seyen37 用戶（主帳號 seyen37 + 備份帳號 seyenbot）
estimated_time: 第一次 30-45 分鐘，之後每次 push 一個命令搞定
---

# 雙 GitHub 帳號 SSH 設置 + 多 remote 上傳

## 0. 為什麼這樣設計

| 需求 | 解法 |
|---|---|
| 兩個 GitHub 帳號（主 + 備份）| 兩組 SSH key，各配對對應帳號 |
| 不要每次 push 都輸入密碼 | SSH key + （可選）ssh-agent |
| 同一台電腦切換帳號方便 | `~/.ssh/config` 用 Host alias 區分 |
| 一鍵 push 同步兩邊 | git remote set-url --add --push（Phase 7）|

**設計圖**：

```
您的電腦
├── ~/.ssh/id_ed25519_seyen37（私鑰，給主帳號）
├── ~/.ssh/id_ed25519_seyen37.pub（公鑰 → 上傳到 seyen37 GitHub）
├── ~/.ssh/id_ed25519_seyenbot（私鑰，給備份帳號）
├── ~/.ssh/id_ed25519_seyenbot.pub（公鑰 → 上傳到 seyenbot GitHub）
└── ~/.ssh/config（區分兩個 host alias）
        │
        ▼
git@github.com-seyen37:seyen37/petoi-bittle-koding.git  ← 走 seyen37 私鑰
git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git ← 走 seyenbot 私鑰
```

---

## Phase 1：生成兩組 SSH key

**先檢查您 Windows 是否有 ssh-keygen**（Win 10 1809+ 與 Win 11 都內建）：

```cmd
ssh-keygen --help
```

應該回傳一段使用說明。如果說「不是內部或外部命令」，到 Windows 設定 → 應用程式 → 選用功能 → 加入 OpenSSH 用戶端。

### 1.1 為主帳號 seyen37 生成 key

```cmd
mkdir %USERPROFILE%\.ssh 2>nul
ssh-keygen -t ed25519 -C "seyen37@gmail.com" -f %USERPROFILE%\.ssh\id_ed25519_seyen37 -N ""
```

說明：
- `-t ed25519`：用 Ed25519 演算法（比 RSA 短、安全、快）
- `-C "..."`：comment（GitHub 只看到 email，識別用）
- `-f`：指定檔名（不用預設 id_ed25519，避免覆蓋）
- `-N ""`：不設 passphrase（簡單，但低安全；如要每次輸入 passphrase，改 `-N "您的密碼"`）

執行成功會看到：
```
Your identification has been saved in C:\Users\F0012\.ssh\id_ed25519_seyen37
Your public key has been saved in C:\Users\F0012\.ssh\id_ed25519_seyen37.pub
```

### 1.2 為備份帳號 seyenbot 生成 key

```cmd
ssh-keygen -t ed25519 -C "seyenbot 對應的 email" -f %USERPROFILE%\.ssh\id_ed25519_seyenbot -N ""
```

把 `seyenbot 對應的 email` 換成 seyenbot 帳號註冊的 email。如果用同一個 email，寫 `seyen37@gmail.com` 也行（comment 只是識別，不影響功能）。

### 1.3 確認檔案產生

```cmd
dir %USERPROFILE%\.ssh
```

應看到 4 個檔案：
```
id_ed25519_seyen37
id_ed25519_seyen37.pub
id_ed25519_seyenbot
id_ed25519_seyenbot.pub
```

---

## Phase 2：把公鑰上傳到對應的 GitHub 帳號

### 2.1 複製主帳號公鑰

```cmd
type %USERPROFILE%\.ssh\id_ed25519_seyen37.pub
```

cmd 會印出：
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxxxxxxxx seyen37@gmail.com
```

**選取整行 → 右鍵複製**（cmd 用滑鼠選取會自動複製）。

### 2.2 加到 seyen37 GitHub

1. **登入 https://github.com/seyen37**（用 seyen37 帳號）
2. 訪問 https://github.com/settings/keys
3. 點 **New SSH key**
4. **Title**：`My PC - seyen37 main`
5. **Key type**：Authentication Key
6. **Key**：貼剛才複製的整段
7. 點 **Add SSH key**

### 2.3 切到 seyenbot 帳號做一次同樣事

```cmd
type %USERPROFILE%\.ssh\id_ed25519_seyenbot.pub
```

複製輸出，**登出 seyen37 → 登入 seyenbot**，到 https://github.com/settings/keys 加 SSH key。

---

## Phase 3：設定 ~/.ssh/config 區分兩個帳號

### 3.1 建立或編輯 config 檔

cmd 開啟記事本編輯：
```cmd
notepad %USERPROFILE%\.ssh\config
```

如果問是否建立新檔案，選「是」。

### 3.2 貼以下內容（整段照貼）

```
# === Main GitHub account: seyen37 ===
Host github.com-seyen37
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_seyen37
    IdentitiesOnly yes

# === Backup GitHub account: seyenbot ===
Host github.com-seyenbot
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_seyenbot
    IdentitiesOnly yes
```

存檔離開記事本。

⚠️ **重點**：這個檔案不能有副檔名！如果記事本存成 `config.txt`，要把它改名（去掉 `.txt`）。

確認檔名正確：
```cmd
dir %USERPROFILE%\.ssh\config
```

應該看到 `config`（無副檔名）。

---

## Phase 4：測試 SSH 連線兩個帳號

### 4.1 測試主帳號

```cmd
ssh -T git@github.com-seyen37
```

第一次會問是否信任主機，輸入 `yes`。

成功會回：
```
Hi seyen37! You've successfully authenticated, but GitHub does not provide shell access.
```

### 4.2 測試備份帳號

```cmd
ssh -T git@github.com-seyenbot
```

成功會回：
```
Hi seyenbot! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ 兩個都成功 → SSH 設置 OK，繼續 Phase 5。
❌ 失敗 → 看故障排除章節。

---

## Phase 5：在兩個 GitHub 帳號各建空 repo

### 5.1 主帳號 seyen37

1. 登入 seyen37 → 訪問 https://github.com/new
2. **Repository name**：`petoi-bittle-koding`
3. **Description**：`Scratch-like 網頁編程工具，支援多機器人（Bittle / 雙足 / Go1 / microbit）`
4. **Public**
5. ⚠️ 不要勾 README / .gitignore / LICENSE（我們本地都有了）
6. 點 **Create repository**

### 5.2 備份帳號 seyenbot

切換 GitHub 帳號到 seyenbot，**重複同樣動作**：
- repo 名一樣 `petoi-bittle-koding`
- 一樣 Public（或 Private 看您想要備份多嚴格）
- 不勾 README / .gitignore / LICENSE

---

## Phase 6：本地 git init + 加兩個 remote + 推上去

### 6.1 在專案資料夾初始化 git

```cmd
cd C:\Users\F0012\Documents\CoWork\Petoi\petoi-bittle-koding

git init
git add .
git commit -m "Initial commit: Petoi Bittle Koding v0.1.0 — MVP with multi-robot architecture, WORKLOG, DECISIONS"
git branch -M main
```

### 6.2 設定 git 身份（如還沒做過）

```cmd
git config --global user.name "seyen37"
git config --global user.email "seyen37@gmail.com"
```

### 6.3 加兩個 remote

注意 URL 用我們在 `~/.ssh/config` 設的 host alias（**不是 github.com，是 github.com-seyen37**）：

```cmd
git remote add origin git@github.com-seyen37:seyen37/petoi-bittle-koding.git
git remote add backup git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git
```

確認設定：
```cmd
git remote -v
```

應顯示：
```
backup  git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git (fetch)
backup  git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git (push)
origin  git@github.com-seyen37:seyen37/petoi-bittle-koding.git (fetch)
origin  git@github.com-seyen37:seyen37/petoi-bittle-koding.git (push)
```

### 6.4 推到兩個 remote

```cmd
git push -u origin main
git push -u backup main
```

成功會看到兩次：
```
Enumerating objects: ...
Writing objects: 100% (xx/xx), done.
To github.com-seyen37:seyen37/petoi-bittle-koding.git
 * [new branch]      main -> main
```

### 6.5 啟用 GitHub Pages（只在主帳號做）

1. 訪問 `https://github.com/seyen37/petoi-bittle-koding`
2. 點 **Settings** → 左側 **Pages**
3. **Source** 選 `Deploy from a branch`
4. **Branch** 選 `main` / `/ (root)` → **Save**
5. 等 1-3 分鐘
6. 訪問 `https://seyen37.github.io/petoi-bittle-koding/`

✅ 完成！工具已上線。

---

## Phase 7：（進階）一個命令推到兩邊

如果您懶得每次 `git push origin` + `git push backup`，可設定 origin **同時 push** 到兩邊：

```cmd
git remote set-url --add --push origin git@github.com-seyen37:seyen37/petoi-bittle-koding.git
git remote set-url --add --push origin git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git
```

之後只要：
```cmd
git push origin main
```

就會同時推到 seyen37 + seyenbot 兩個 GitHub。

確認設定：
```cmd
git remote -v
```

origin 那條會顯示 2 個 (push) URL。

⚠️ 如果某次只想推到一邊，臨時用：
```cmd
git push backup main
```

---

## Phase 8：日常使用（每次更新 5 分鐘）

之後 Cowork session 改完 code，要更新 GitHub：

```cmd
cd C:\Users\F0012\Documents\CoWork\Petoi\petoi-bittle-koding

:: 看改了什麼
git status

:: 加全部變動
git add .

:: commit
git commit -m "feat: 加 v0.2 步態積木"

:: push 到兩邊（如已設 Phase 7）
git push origin main

:: 或分開 push
git push origin main
git push backup main
```

3 個命令搞定。Pages 自動更新（等 1-3 分鐘）。

**Commit message 慣例**（見 `docs/github-deploy-guide.md` 第 3 節）：
- `feat:` 新功能
- `fix:` bug 修復
- `docs:` 文件變更
- `refactor:` 重構

---

## 故障排除

### 問題 1：`ssh-keygen` 不認識

**原因**：Windows OpenSSH 沒裝。

**解法**：
- Win 11：設定 → 應用程式 → 選用功能 → 加入「OpenSSH 用戶端」
- 或裝 Git for Windows，用 Git Bash 跑（Git Bash 內建 ssh-keygen）

### 問題 2：`ssh -T git@github.com-seyen37` 回 `Permission denied (publickey)`

**可能原因**：
1. 公鑰沒上傳到 GitHub → 重做 Phase 2
2. config 檔名錯了（變 config.txt）→ `dir %USERPROFILE%\.ssh\config*` 確認
3. Identity File 路徑錯 → 確認 `~/.ssh/id_ed25519_seyen37` 存在
4. SSH config 縮排有 tab 或全形空白 → 重貼 config 內容

**Debug**：
```cmd
ssh -vT git@github.com-seyen37
```
看詳細 log。

### 問題 3：git push 卡很久或失敗

**可能原因**：
- 網路問題 → 換網路、檢查防火牆
- 公司 / 學校網路擋 SSH port 22 → 改用 HTTPS（Port 443），但要回去 PAT 模式

**解法**：用 SSH over HTTPS（GitHub 支援）：
編輯 `~/.ssh/config`：
```
Host github.com-seyen37
    HostName ssh.github.com
    User git
    Port 443
    IdentityFile ~/.ssh/id_ed25519_seyen37
    IdentitiesOnly yes
```

### 問題 4：兩個帳號搞混 push 到錯的地方

**Debug**：
```cmd
git remote -v
```

看每個 remote 的 URL 是哪個 alias。重設：
```cmd
git remote set-url origin git@github.com-seyen37:seyen37/petoi-bittle-koding.git
git remote set-url backup git@github.com-seyenbot:seyenbot/petoi-bittle-koding.git
```

### 問題 5：Pages 顯示 404

**可能原因**：
- 部署沒完成（等 3 分鐘再試）
- 主分支不是 main（檢查 `git branch` 確認）
- repo 是 Private（GitHub 免費版 Private repo 不能用 Pages，要 Pro）

---

## 額外：用 ssh-agent 記住 passphrase（如有設）

如果 Phase 1 您設了 passphrase（為了安全），每次 push 都要輸入很煩。用 ssh-agent：

```cmd
:: 啟動 ssh-agent service（一次性）
powershell -Command "Start-Service ssh-agent; Set-Service ssh-agent -StartupType Automatic"

:: 把 key 加到 agent（每次重開機後做一次）
ssh-add %USERPROFILE%\.ssh\id_ed25519_seyen37
ssh-add %USERPROFILE%\.ssh\id_ed25519_seyenbot
```

之後 push 不必輸入 passphrase。

---

## 安全提醒

- **私鑰永不外洩**：`id_ed25519_seyen37`、`id_ed25519_seyenbot` 兩個檔**絕不**上傳 / 給人 / 傳訊息
- **公鑰可公開**：`.pub` 結尾的檔可以分享（已上傳 GitHub 就是公開的）
- **電腦遺失**：到 GitHub Settings → SSH and GPG keys → 刪除對應 key（之後駭客無法用該 key 連 GitHub）
- **定期檢查**：偶爾去 `https://github.com/settings/keys` 確認沒有不認識的 key

---

## Checklist

跑完本指引後，您應該：

- [x] `~/.ssh/` 有 4 個檔案（2 對 key + config）
- [x] 兩個 GitHub 帳號的 Settings → SSH keys 各有 1 個 key
- [x] `ssh -T git@github.com-seyen37` 與 `ssh -T git@github.com-seyenbot` 都成功
- [x] 兩個 GitHub 帳號各有 `petoi-bittle-koding` repo
- [x] 本地 `git remote -v` 顯示 origin 與 backup 兩個 remote
- [x] `git push -u origin main` 與 `git push -u backup main` 都成功
- [x] `https://seyen37.github.io/petoi-bittle-koding/` 上線可訪問

---

*雙 GitHub 帳號設置指引 v1.0 完成於 2026-04-27。SSH key 設好後一勞永逸。*
