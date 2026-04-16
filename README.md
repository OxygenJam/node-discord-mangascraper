# Madoka Senpai / マドカ先輩

A Discord bot that retrieves manga information using the [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/). Search for any manga directly in Discord via message command or slash command.

> This is in no means an attempt to steal the character Madoka from PMMM.

## Usage

**Message command:**
```
?<manga-name>
```

**Slash command:**
```
/get-manga <manga-name>
```

Madoka Senpai will return an embed with the manga's title, cover, description, and AniList link.

## Local Development

### Prerequisites

- Node.js 18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   token=YOUR_DISCORD_BOT_TOKEN
   ```

3. Run the bot:
   ```bash
   npm run start
   ```

### Running Tests

```bash
npx jest
```

## Deployment (Fly.io)

The app is deployed to [Fly.io](https://fly.io) as a Docker container.

### Prerequisites

- [flyctl](https://fly.io/docs/hands-on/install-flyctl/) installed
- A Fly.io account

### Steps

1. **Authenticate with Fly.io:**
   ```bash
   fly auth login
   ```

2. **Set your Discord bot token as a secret** (do not put the token in `.env` for production — set it directly on Fly.io):
   ```bash
   fly secrets set token=YOUR_DISCORD_BOT_TOKEN
   ```

3. **Deploy:**
   ```bash
   fly deploy
   ```
   This builds the Docker image and deploys it to the `madoka-senpai` app in the `syd` (Sydney) region.

4. **Verify the deployment:**
   ```bash
   fly status
   fly logs
   ```

### Re-deploying after changes

Push your changes to the repo, then run:
```bash
fly deploy
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `token`  | Discord bot token | Yes |

## Bug Reports & Feature Requests

File an issue on this repo.
