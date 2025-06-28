export async function fetchLeaderboard(gameType: string) {
    const response = await fetch(`https://server.datasenseai.com/battleground-leaderboard/${gameType}`);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
} 